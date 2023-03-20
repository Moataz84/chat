import { Server } from 'socket.io'
import ImageKit from 'imagekit'
import { v4 } from 'uuid'
import { checkRequest, connectDB } from '../../middleware'
import Users from '../../Users'
import Chats from '../../Chats'

const handler = async (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {maxHttpBufferSize: '5e6'})
    res.socket.server.io = io

    const imagekit = new ImageKit({
      publicKey : process.env.PUBLIC_KEY,
      privateKey : process.env.PRIVATE_KEY,
      urlEndpoint : 'https://ik.imagekit.io/pk4i4h8ea/'
    })

    const reorderChats = async data => {
      for (let member of data.members) {
        const user = await Users.findOne({_id: member})
        const current = user.chats.find(chat => chat.roomId === data.roomId)
        const chats = user.chats.map(chat => {
          if (current.roomId === chat.roomId) {
            return {...chat, index: 0}
          }
          if (chat.index < current.index) {
            return {...chat, index: chat.index + 1}
          } else {
            return {...chat, index: chat.index}
          }
        })
        await Users.findOneAndUpdate({_id: member}, {$set: {chats}})
      }
    }

    io.on('connection', socket => {
      
      // Join Chat Rooms Connection
      socket.on('join-rooms', rooms => rooms.forEach(room => socket.join(room)))

      // Send Friend Request
      socket.on('send-friend-request', async data => {
        io.emit('sent-request', {id: data.request.id, requested: data.requested})
        await Users.findOneAndUpdate({_id: data.requested.id}, {$push: {requests:  data.request.id}})
        await Users.findOneAndUpdate(
          {_id: data.request.id}, 
          {$push: {requested: {id: data.requested.id, seen: false}}}
        )
      })

      // Remove Friend Request
      socket.on('remove-friend-request', async data => {
        await Users.findOneAndUpdate({_id: data.id}, {$pull: {requests: data.requestedId}})
        const user = await Users.findOneAndUpdate(
          {_id: data.requestedId}, 
          {$pull: {requested: {id: data.id}}}, 
          {new: true}
        )
        io.emit('remove-request', {id: data.requestedId, requested: user.requested})
      })

      // Acept Friend Request
      socket.on('accept-friend-request', async data => {
        const user = await Users.findOneAndUpdate(
          {_id: data.friend.id}, 
          {$push: {friends: data.requestedFriend.id}, $pull: {requests: data.requestedFriend.id}},
          {new: true}
        )
        io.emit(
          'accept-request', 
          {id: data.friend.id, friend: data.requestedFriend, requests: user.requests, directChat: data.directChat}
        )
        await Users.findOneAndUpdate(
          {_id: data.requestedFriend.id}, 
          {$push: {friends: data.friend.id}, $pull: {requested: {id: data.friend.id}}}
        )
        if (data.directChat !== undefined) {
          await Chats.findOneAndUpdate({roomId: data.directChat.roomId}, {$set: {disabled: false}})
        }
      })

      // Decline Friend Request
      socket.on('decline-friend-request', async data => {
        await Users.findOneAndUpdate({_id: data.id}, {$pull: {requested: {id: data.requestedId}}})
        const user = await Users.findOneAndUpdate(
          {_id: data.requestedId}, 
          {$pull: {requests: data.id}}, 
          {new: true}
        )
        io.emit('decline-request', {id: data.requestedId, requests: user.requests})
      })

      // Remove Friend
      socket.on('remove-friend', async data => {
        io.emit('remove-friend-user', {id: data.requestedId, friendId: data.id, directChat: data.directChat})
        await Users.findOneAndUpdate({_id: data.id}, {$pull: {friends: data.requestedId}})
        await Users.findOneAndUpdate({_id: data.requestedId}, {$pull: {friends: data.id}})

        if (data.directChat !== undefined) {
          await Chats.findOneAndUpdate({roomId: data.directChat.roomId}, {$set: {disabled: true}})
        }
      })

      // Create Chat
      socket.on('create-chat', async data => {
        socket.join(data.chat.roomId)

        const createNewChat = async () => {
          io.emit('chat-created', {chat: data.stateChat, members: data.ids, exists: false})
          await Chats({...data.chat}).save()
          for (let member of data.chat.members) {
            const user = await Users.findOne({_id: member})
            const chats = [
              ...user.chats.map(chat => ({...chat, index: chat.index + 1})),
              {roomId: data.chat.roomId, index: 0, seen: []}
            ]
            await Users.findOneAndUpdate({_id: member}, {$set: {chats}})
          }
        }

        if (data.chat.members.length === 2) {
          const existingChat = await Chats.findOne(
            {members: {$in: data.chat.members}, notActive: [data.chat.members[0]]}
          )
          if (existingChat) {
            const message = {
              id: v4(),
              from: data.chat.members[0],
              data: `${data.stateChat.members[0].username} has rejoined the chat.`,
              type: 'alert',
              date: new Date().toISOString()
            }
            const chat = {
              index: 0,
              roomId: existingChat.roomId,
              name: data.stateChat.members[1].username,
              profile: data.stateChat.members[1].profile,
              members: data.stateChat.members,
              messages: [...existingChat.messages, message],
              disabled: false,
              notActive: [],
              seen: []
            }
            io.emit('chat-created', {chat, members: [data.chat.members[0]], exists: true})
            const user = await Users.findOne({_id: data.chat.members[0]})
            const chats = [
              ...user.chats.map(chat => ({...chat, index: chat.index + 1})),
              {roomId: existingChat.roomId, index: 0, seen: []}
            ]
            await Users.findOneAndUpdate({_id: data.chat.members[0]}, {$set: {chats}})
            await Chats.findOneAndUpdate(
              {roomId: existingChat.roomId}, 
              {$set: {notActive: []}, $push: {messages: message}}
            )
            await reorderChats({members: [data.chat.members[1]], roomId: existingChat.roomId})
          } else {
            createNewChat()
          }
        } else {
          createNewChat()
        }
      })

      // Join New Chats
      socket.on('join-new-chat', room => socket.join(room))

      // Update Group Name
      socket.on('name-update', async data => {
        io.to(data.roomId).emit('receive-name-update', data)
        await Chats.findOneAndUpdate(
          {roomId: data.roomId}, 
          {$set: {name: data.name}, $push: {messages: data.messageData}}
        )
        await reorderChats(data)
      })
      
      // Update Group Profile
      socket.on('profile-update', async data => {
        io.to(data.roomId).emit('receive-profile-update', data)

        const base64 = data.dataUrl.split(',')[1]
        const fileName = `${data.roomId}-profile.${data.extension}`

        const result = await Chats.findOne({roomId: data.roomId})
        if (result.profile.pictureUrl.includes(data.roomId)) {
          imagekit.deleteFile(result.profile.pictureId, () => {})
        }

        imagekit.upload({
          file: base64,
          fileName,
          folder: 'chat-website/chats/group-profiles'
        }, async (e, result) => {
          const profile = {
            pictureUrl: result.url,
            pictureId: result.fileId
          }
          await Chats.findOneAndUpdate(
            {roomId: data.roomId}, 
            {$set: {profile}, $push: {messages: data.messageData}}
          )
        })
        await reorderChats(data)
      })

      // Send Message
      socket.on('send-message', async data => {
        io.to(data.roomId).emit('recieve-message', data)
        await Chats.findOneAndUpdate({roomId: data.roomId}, {$push: {messages: data.messageData}}) 
        await reorderChats(data)
      })

      // Send Image
      socket.on('send-image', async data => {
        io.to(data.roomId).emit('receive-image', data)
        const base64 = data.messageData.dataUrl.split(',')[1]
        const fileName = `${data.messageData.id}.${data.messageData.extension}`
        imagekit.upload({
          file: base64,
          fileName,
          folder: `chat-website/chats/chat-data/${data.roomId}`
        }, async (e, result) => {
          const message = {
            id: data.messageData.id,
            from: data.messageData.from,
            picture: result.url,
            type: data.messageData.type,
            date: data.messageData.date
          }
          await Chats.findOneAndUpdate({roomId: data.roomId}, {$push: {messages: message}}) 
        })
        await reorderChats(data)
      })
      
      // Delete Message
      socket.on('delete-message', async data => {
        io.to(data.roomId).emit('message-deleted', data)
        await Chats.findOneAndUpdate(
          {roomId: data.roomId}, 
          {$set: {'messages.$[el]': {...data.message, deleted: true, data: 'This message was deleted.'}}}, 
          {arrayFilters: [{ 'el.id': data.message.id }]}
        )
        await reorderChats(data)
      })

      // Delete Account
      socket.on('delete-account', async data => {
        io.emit('user-account-deleted', {id: data.messageData.from})
        data.chats.forEach(chat => {
          io.in(chat).emit('recieve-chat-leave', {messageData: data.messageData, roomId: chat})
        })
        await Chats.updateMany(
          {roomId: data.chats}, 
          {$push: {messages: data.messageData, notActive: data.messageData.from}}
        )
        await Users.findOneAndUpdate(
          {_id: data.messageData.from}, 
          {$set: {disabled: true, friends: [], requests: [], requested: [], chats: []}} 
        )
        await Users.updateMany({_id: data.friends}, {$pull: {friends: data.messageData.from}})
        await Users.updateMany({_id: data.requested}, {$pull: {requests: data.messageData.from}})
        await Users.updateMany({_id: data.requests}, {$pull: {requested: {id: data.messageData.from}}})
      })
      
      // Leave Chat
      socket.on('leave-chat', async data => {
        socket.leave(data.roomId)
        io.to(data.roomId).emit('recieve-chat-leave', data)
        
        const c = await Chats.findOneAndUpdate(
          {roomId: data.roomId}, 
          {$push: {messages: data.messageData, notActive: data.messageData.from}},
          {new: true}
        )
        await reorderChats({roomId: data.roomId, members: c.members.filter(m => m !== data.messageData.from)})

        const user = await Users.findOneAndUpdate({_id: data.messageData.from}, {$pull: {chats: {roomId: data.roomId}}})
        const current = user.chats.find(chat => chat.roomId === data.roomId)
        const chats = user.chats.filter(chat => chat.roomId !== data.roomId).map(chat => {
          if (chat.index > current.index) {
            return {...chat, index: chat.index - 1}
          } else {
            return {...chat, index: chat.index}
          }
        })
        await Users.findOneAndUpdate({_id: data.messageData.from}, {$set: {chats}})
      })

      // Add Member
      socket.on('add-member', async data => {
        io.emit('member-join', {id: data.member, roomId: data.chat.roomId, chat: {...data.chat, seen: []}})
        io.to(data.chat.roomId).emit('member-added', data)
              
        await reorderChats({
          roomId: data.chat.roomId, 
          members: data.chat.members.filter(m => m.id !== data.member).map(m => m.id)
        })
        const user = await Users.findOne({_id: data.member})
        const chats = user.chats.map(chat => ({...chat, index: chat.index + 1}))
        await Users.findOneAndUpdate(
          {_id: data.member}, 
          {$set: {chats: [...chats, {roomId: data.chat.roomId, index: 0, seen: []}]}}
        )
        await Chats.findOneAndUpdate(
          {roomId: data.chat.roomId}, 
          {
            $push: {messages: data.messageData}, 
            $set: {members: data.chat.members.map(m => m.id), notActive: data.chat.notActive}
          }
        )
        if (data.newMember) {
          await Chats.findOneAndUpdate(
            {roomId: data.chat.roomId}, 
            {$set: {name: data.chat.name, profile: data.chat.profile}}
          )
        }
      })
    })
  }
  res.end()
}

export default connectDB(checkRequest(handler))