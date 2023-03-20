import React, { useEffect, useState, useRef} from 'react'
import { FiDelete } from 'react-icons/fi'
import { v4 } from 'uuid'
import { useUser } from '../../../../contexts/UserContext'
import { useCurrentChat } from '../../../../contexts/CurrentChatContext'
import { socket } from '../../../../socket-client'
import styles from '../../../../styles/chat.module.css'

const isUrl = str => {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

const MyMessage = ({message, deleteMessage, selectImage, containerRef, setChatTime}) => {
  const user = useUser()

  return (
    <div id={styles['my-message']} className={styles.message} key={message.id}>
      {
        !message.deleted?
          <FiDelete size={22} className={styles.unsend} onClick={e => deleteMessage(e, message)} />
        :
          <></>
      }
      {
        message.data === undefined?
          <img 
            className={styles.picture} 
            src={message.picture} 
            onClick={() => selectImage(message.picture)} 
            onLoad={() => containerRef.current?.scrollTo(0, containerRef.current.scrollHeight)}
          />
        : 
          <p className={styles.mine}>
            {
              message.data.split(' ').map(str => {
                if (isUrl(str)) {
                  return <a key={v4()} className={`${styles.mine} ${styles.link}`} href={str} target='_blank'>{str} </a>
                }
                return `${str} `
              })
            }
          </p>
      }
      <img src={user.user.profile.pictureUrl} />
      <span>{setChatTime(message.date)}</span>
    </div>
  )
}

const OtherMessage = ({message, selectImage, containerRef, setChatTime}) => {
  const currentChat = useCurrentChat()

  return (
    <div className={styles.message} key={message.id}>
      <img 
        src={currentChat.currentChat.members.find(member => member.id === message.from).
        profile.pictureUrl} 
      />
      {
        message.data === undefined?
          <img 
            className={styles.picture} 
            src={message.picture} 
            onClick={() => selectImage(message.picture)} 
            onLoad={() => containerRef.current?.scrollTo(0, containerRef.current.scrollHeight)}
          />
        : 
          <p>
            {
              message.data.split(' ').map(str => {
                if (isUrl(str)) {
                  return <a key={v4()} className={styles.link} href={str} target='_blank'>{str} </a>
                }
                return `${str} `
              })
            }
          </p>
      }
      <span>{setChatTime(message.date)}</span>
    </div>
  )
}

const Messages = ({ search, setImage, setShowImage }) => {

  const user = useUser()

  const currentChat = useCurrentChat()

  const containerRef = useRef()

  const [serchDateIds, setSearchDateIds] = useState([])

  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight)
  }, [currentChat?.currentChat?.roomId, user.chats.find(c => c.roomId === currentChat?.currentChat.roomId)?.messages])

  useEffect(() => {
    const ids = sortByDate(user.chats.find(chat => chat.roomId === currentChat.currentChat.roomId)?.messages).
    filter(m => m.messages.some(message => message.data?.toLowerCase().includes(search.toLowerCase()))).map(i => i.date)
    setSearchDateIds(ids)
  }, [search])

  // Displaying Messages
  const sortByDate = array => {
    const results = []
    array?.forEach(entry => {
      const includesArray = results?.find(
        i => new Date(new Date(i.date).toISOString()).toDateString() === new Date(entry.date).toDateString()
      )
      if (includesArray === undefined) {
        results.push({
          date: entry.date,
          messages: new Array(entry)
        })
      } else {
        includesArray.messages.push(entry)
      }
    })
    return results
  }

  const searchFunc = messages => {
    return messages?.filter(
      message => search !== ''? 
        message.data?.toLowerCase().includes(search.toLowerCase())
      : 
        message
    )
  }

  // Message Functions
  const selectImage = img => {
    setImage(img)
    setShowImage(true)
  }

  const deleteMessage = (e, message) => {
    e.preventDefault()
    socket.emit(
      'delete-message', 
      {
        roomId: currentChat.currentChat.roomId, 
        members: currentChat.currentChat.members.map(member => member.id), 
        message,
      }
    )
  }

  const setChatDate = date => {
    const month = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ]

    const d = new Date()
    d.setDate(d.getDate() - 1)
    const givenDate = new Date(date)
    
    const isYesterday = new Date(d.toISOString()).toDateString() === new Date(date).toDateString()
    const isToday = new Date(new Date().toISOString()).toDateString() === new Date(date).toDateString()
    const today = `${month[givenDate.getMonth()]} ${givenDate.getDate()}, ${givenDate.getFullYear()}`

    if (isToday) return 'Today'
    if (isYesterday) return 'Yesterday'
    else return today
  }

  const setChatTime = date => {
    const time = new Date(date)
    
    const hours = time.getHours()
    const minutes = time.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'

    hours = hours % 12;
    hours = hours ? hours : 12
    minutes = minutes < 10 ? `0${minutes}` : minutes
    return `${hours}:${minutes} ${ampm}`
  }

  return (
    <div className={styles.messages} ref={containerRef}>
      {
        sortByDate(user.chats.find(chat => chat.roomId === currentChat.currentChat.roomId)?.messages).map(group => (
          <div className={styles['message-groups']} key={group.date}>
            <p style={{display: (search !== '' && !serchDateIds.includes(group.date))? 'none': 'block'}}>
              {setChatDate(group.date)}
            </p>
            {
              searchFunc(group?.messages).map(message => (
                message.type === 'message'?
                  message.from === user.user.id?
                    <MyMessage 
                      key={message.id}
                      containerRef={containerRef}
                      deleteMessage={deleteMessage}
                      message={message}
                      selectImage={selectImage}
                      setChatTime={setChatTime}
                    />
                  :
                    <OtherMessage 
                      key={message.id}
                      containerRef={containerRef}
                      message={message}
                      selectImage={selectImage}
                      setChatTime={setChatTime}
                    />
                :
                  <p className={styles.alert} key={message.id}>{message.data}</p>
              ))
            }
          </div>
        ))
      }
    </div>
  )
}

export default Messages