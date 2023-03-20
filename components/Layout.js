import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../contexts/UserContext'
import { useUsers } from '../contexts/UsersContext'
import { useCurrentChat } from '../contexts/CurrentChatContext'
import { socket, connectSocket } from '../socket-client'
import { routes } from '../variables'
import equalsIgnoreOrder from '../functions/compare-array'
import Menu from './Menu'
import Loading from './Loading'
import styles from '../styles/main.module.css'

const Layout = ({ children }) => {

  const router = useRouter()
  const pathname = router.pathname

  const user = useUser()
  const users = useUsers()
  const currentChat = useCurrentChat()

  const [userId, setUserId] = useState(false)

  // Socket Connection
  useEffect(() => {
    const connect = async () => await connectSocket()
    connect()
  }, [])

  // User Data
  useEffect(() => {
    const getData = async () => {
      const result = await user.getUser()
      if (result.signed === true) {
        setUserId(result.id)
        socket.emit('join-rooms', result.rooms)
      }
      else setUserId(false)
    }
    getData()
  }, [user.loggedIn])

  useEffect(() => {
    const getUsersData = async () => {
      if (userId !== false) users.getUsers(userId)
      else {
        users.resetState()
        currentChat.setCurrentChat({})
      }
    }
    getUsersData()
  }, [userId])

  // Request Notifications
  useEffect(() => {
    user.setRequestNotifications(user.user.requested?.filter(request => request.seen === false).length)
  }, [user.user.requested])

  // Chat Notifications
  useEffect(() => {
    const setLastMessage = async () => {
      if (currentChat.currentChat?.roomId === undefined) return 
      const selectedChat = user.chats.find(c => c.roomId === currentChat.currentChat.roomId)
      const otherMessages = [...selectedChat?.messages].filter(msg => msg.from !== user.user.id).map(e => e.id)

      user.setChats(previous => [
        ...previous.filter(c => c.roomId !== currentChat.currentChat.roomId),
        {...selectedChat, seen: otherMessages}
      ])

      await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/set-last-message`, {
        method: 'POST',
        body: JSON.stringify({
          id: user.user.id, 
          roomId: currentChat.currentChat.roomId,
          seen: otherMessages
        }),
        headers: { 
          'Content-Type': 'application/json'
        }
      })
    }
    setLastMessage()
  }, [user.chats.find(c => c.roomId === currentChat.currentChat?.roomId)?.messages])

  // Reset Current Chat
  useEffect(() => {
    if (pathname !== '/') currentChat.setCurrentChat({})
  }, [pathname])

  // Current Chat Updates
  useEffect(() => {
    if (currentChat.currentChat?.roomId !== undefined) {
      const chat = user.chats.find(c => c.roomId === currentChat.currentChat.roomId)
      currentChat.setCurrentChat({
        name: chat?.name, 
        roomId: chat?.roomId, 
        members: chat?.members,
        profile: chat?.profile,
        disabled: chat?.disabled,
        notActive: chat?.notActive
      })
    }
  }, [user.chats])

  // Socket Functions
  useEffect(() => {
    if (socket !== undefined) {

      socket.on('sent-request', data => {
        if (data.id === user.user.id) {
          user.setUser(previous => ({
            ...previous, 
            requested: [...previous.requested, {...data.requested, seen: false}]
          }))
        }
      })

      socket.on('remove-request', data => {
        if (data.id === user.user.id) {
          user.setUser(previous => ({...previous, requested: data.requested}))
        }
      })

      socket.on('accept-request', data => {
        if (data.id === user.user.id) {
          user.setUser(previous => (
            {...previous, friends: [...previous.friends, data.friend], requests: data.requests})
          )
          if (data.directChat !== undefined) {
            user.setChats(previous => ([
              ...previous.filter(chat => chat.roomId !== data.directChat.roomId),
              {
                ...previous.find(chat => chat.roomId === data.directChat.roomId),
                disabled: false
              }
            ]))
          }
        }
      })

      socket.on('decline-request', data => {
        if (data.id === user.user.id) {
          user.setUser(previous => ({...previous, requests: [...data.requests]}))
        }
      })

      socket.on('remove-friend-user', data => {
        if (data.id === user.user.id) {
          user.setUser(previous => 
            ({...previous, friends: previous.friends.filter(friend => friend.id !== data.friendId)})
          )
          if (data.directChat !== undefined) {
            user.setChats(previous => ([
              ...previous.filter(chat => chat.roomId !== data.directChat.roomId),
              {
                ...previous.find(chat => chat.roomId === data.directChat.roomId),
                disabled: true
              }
            ]))
          }
        }
      })

      socket.on('chat-created', data => {
        if (!data.exists) {
          if (!data.members.includes(user.user.id)) return
          user.setChats(previous =>  [
            {...data.chat, seen: []},
            ...previous.map(chat => ({...chat, index: chat.index + 1}))
          ])
        } else {
          if (data.members.includes(user.user.id)) {
            user.setChats(previous =>  [
              data.chat,
              ...previous.filter(c => !equalsIgnoreOrder(c.members.map(m => m.id), data.chat.members.map(m => m.id))).
              map(chat => ({...chat, index: chat.index + 1}))
            ])
          } else {
            user.setChats(previous => {
              const current = previous.find(chat => chat.roomId === data.chat.roomId)
              return previous.map(chat => {
                if (chat === current) {
                  return {...chat, index: 0, notActive: [], messages: data.chat.messages}
                } else {
                  return {...chat, index: chat.index + 1}
                }
              })
            })
          }
        }
        socket.emit('join-new-chat', data.chat.roomId)        
      })

      socket.on('receive-name-update', data => {
        user.setChats(previous => {
          const current = previous.find(chat => chat.roomId === data.roomId)
          const chats = previous.map(chat => {
            if (current.roomId === chat.roomId) {
              return {
                ...chat, 
                index: 0, 
                name: data.name, 
                messages: [...current.messages, data.messageData]
              }
            }
            if (chat.index < current.index) {
              return {...chat, index: chat.index + 1}
            } else {
              return {...chat, index: chat.index}
            }
          })
          return chats
        })
      })

      socket.on('receive-profile-update', data => {
        user.setChats(previous => {
          const current = previous.find(chat => chat.roomId === data.roomId)
          const chats = previous.map(chat => {
            if (current.roomId === chat.roomId) {
              return {
                ...chat, 
                index: 0, 
                profile: {
                  pictureUrl: data.dataUrl,
                  pictureId: ''
                },
                messages: [...current.messages, data.messageData]}
            }
            if (chat.index < current.index) {
              return {...chat, index: chat.index + 1}
            } else {
              return {...chat, index: chat.index}
            }
          })
          return chats
        })
      })

      socket.on('recieve-message', data => {
        user.setChats(previous => {
          const current = previous.find(chat => chat.roomId === data.roomId)
          const chats = previous.map(chat => {
            if (current.roomId === chat.roomId) {
              return {...chat, index: 0, messages: [...current.messages, data.messageData]}
            }
            if (chat.index < current.index) {
              return {...chat, index: chat.index + 1}
            } else {
              return {...chat, index: chat.index}
            }
          })
          return chats
        })
      })

      socket.on('receive-image', data => {
        user.setChats(previous => {
          const current = previous.find(chat => chat.roomId === data.roomId)
          const message = {
            id: data.messageData.id, 
            from: data.messageData.from,
            picture: data.messageData.dataUrl,
            type: data.messageData.type,
            date: data.messageData.date
          }
          const chats = previous.map(chat => {
            if (current.roomId === chat.roomId) {
              return {...chat, index: 0, messages: [...current.messages, message]}
            }
            if (chat.index < current.index) {
              return {...chat, index: chat.index + 1}
            } else {
              return {...chat, index: chat.index}
            }
          })
          return chats
        })
      })

      socket.on('message-deleted', data => {
        user.setChats(previous => {
          const current = previous.find(chat => chat.roomId === data.roomId)
          const message = current.messages.find(msg => msg.id === data.message.id)
          message.data = 'This message was deleted.'
          message.deleted = true

          const chats = previous.map(chat => {
            if (current.roomId === chat.roomId) {
              return {...chat, index: 0}
            }
            if (chat.index < current.index) {
              return {...chat, index: chat.index + 1}
            } else {
              return {...chat, index: chat.index}
            }
          })
          return chats
        })

      })

      socket.on('recieve-chat-leave', data => {
        user.setChats(previous => {
          const current = previous.find(chat => chat.roomId === data.roomId)
          const chats = previous.map(chat => {
            if (current.roomId === chat.roomId) {
              return {
                ...chat, 
                index: 0, 
                messages: [...current.messages, data.messageData], 
                notActive: [...current.notActive, data.messageData.from]
              }
            }
            if (chat.index < current.index) {
              return {...chat, index: chat.index + 1}
            } else {
              return {...chat, index: chat.index}
            }
          })
          return chats
        })
      })

      socket.on('user-account-deleted', data => {
        users.setUsers(previous => previous.filter(user => user.id !== data.id))
        user.setUser(previous => ({
          ...previous, 
          friends: previous.friends.filter(friend => friend.id !== data.id), 
          requests: previous.requests.filter(request => request.id !== data.id),
          requested: previous.requested.filter(request => request.id !== data.id)
        }))
      })

      socket.on('member-join', data => {
        if (data.id === user.user.id) { 
          socket.emit('join-new-chat', data.roomId)
          user.setChats(previous => ([
            {
              index: 0, 
              name: data.newMember? 
                data.chat.name: data.chat.members.find(member => member.id !== user.user.id).username,
              profile: data.newMember? 
                data.chat.profile: data.chat.members.find(member => member.id !== user.user.id).profile,
              ...data.chat
            },
            ...previous.map(chat => ({index: chat.index + 1, ...chat}))
          ]))
        }
      })

      socket.on('member-added', data => {
        user.setChats(previous => {
          const current = previous.find(chat => chat.roomId === data.chat.roomId)
          const chats = previous.map(chat => {
            if (current.roomId === chat.roomId) {
              return {
                ...chat, 
                index: 0, 
                name: data.newMember? 
                  data.chat.name: data.chat.members.find(member => member.id !== user.user.id).username,
                profile: data.newMember? 
                  data.chat.profile: data.chat.members.find(member => member.id !== user.user.id).profile,
                members: data.chat.members, 
                notActive: data.chat.notActive,
                messages: [...current.messages, data.messageData]
              }
            }
            if (chat.index < current.index) {
              return {...chat, index: chat.index + 1}
            } else {
              return {...chat, index: chat.index}
            }
          })
          return chats
        })
      })
    }
  }, [socket])

  // Change Image Url
  useEffect(() => {
    [...document.querySelectorAll('img')].forEach(async img => {
      const res = await fetch(img.src)
      const blob = await res.blob()
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = () => img.src = reader.result
    })
  })
  
  return (
    <div className={styles.container}>
      {routes.includes(pathname)? <Menu router={router} /> : ''}
      { 
        routes.filter(route => route === '/' || route === '/settings').includes(pathname)?
          user.loading?
            <Loading pathname={pathname} />
          :
            children
        :
          children
      }
    </div>
  )
}

export default Layout