import { v4 } from 'uuid'
import equalsIgnoreOrder from './compare-array'

export const sendFriendRequest = (e, requestedUser, user, socket) => {
  e.preventDefault()
  const request = {
    id: requestedUser.id,
    username: requestedUser.username,
    profile: requestedUser.profile,
  }
  const requested = {
    id: user.user.id,
    username: user.user.username,
    profile: user.user.profile
  }
  user.setUser(({...user.user, requests: [...user.user.requests, request]}))
  socket.emit('send-friend-request', { request, requested })
}

export const removeFriendRequest = (e, requestedId, user, socket) => {
  e.preventDefault()
  user.setUser(({...user.user, requests: user.user.requests.filter(request => request.id !== requestedId)}))
  socket.emit('remove-friend-request', { id: user.user.id, requestedId })
}

export const acceptRequest = (e, requestedUser, user, socket) => {
  e.preventDefault()
  const directChat = user.chats.find(chat =>
    equalsIgnoreOrder(chat.members.map(member => member.id), [user.user.id, requestedUser.id])
  )
  const friend = {
    id: requestedUser.id,
    username: requestedUser.username,
    profile: requestedUser.profile
  }
  const requestedFriend = {
    id: user.user.id,
    username: user.user.username,
    profile: user.user.profile
  }
  const requested = user.user.requested.filter(request => request.id !== requestedUser.id)
  user.setUser(({...user.user, requested, friends: [...user.user.friends, friend]}))
  socket.emit('accept-friend-request', { friend, requestedFriend, directChat})

  if (directChat !== undefined) {
    user.setChats(previous => ([
      ...previous.filter(chat => chat.roomId !== directChat.roomId),
      {
        ...previous.find(chat => chat.roomId === directChat.roomId),
        disabled: false
      }
    ]))
  }
}

export const declineRequest = (e, requestedId, user, socket) => {
  e.preventDefault()
  user.setUser(({...user.user, requested: user.user.requested.filter(request => request.id !== requestedId)}))
  socket.emit('decline-friend-request', { requestedId, id: user.user.id })
}

export const removeFriend = (e, requestedId, user, socket) => {
  e.preventDefault()
  const directChat = user.chats.find(chat =>
    equalsIgnoreOrder(chat.members.map(member => member.id), [user.user.id, requestedId])
  )
  user.setUser(({...user.user, friends: user.user.friends.filter(friend => friend.id !== requestedId)}))
  socket.emit('remove-friend', { id: user.user.id, requestedId, directChat })
  if (directChat !== undefined) {
    user.setChats(previous => ([
      ...previous.filter(chat => chat.roomId !== directChat.roomId),
      {
        ...previous.find(chat => chat.roomId === directChat.roomId),
        disabled: true
      }
    ]))
  } 
}
