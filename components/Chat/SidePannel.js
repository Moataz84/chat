import { useState } from 'react'
import { BsSearch, BsPencilSquare } from 'react-icons/bs'
import { useUser } from '../../contexts/UserContext'
import { useSize } from '../../contexts/ScreeSizeContext'
import { useCurrentChat } from '../../contexts/CurrentChatContext'
import styles from '../../styles/chat.module.css'

const SidePannel = ({ setShow, setPage, setFullscreen }) => {
  
  const size = useSize()

  const user = useUser()

  const currentChat = useCurrentChat()

  const [search, setSearch] = useState('')

  const selectChat = async (e, chat) => {
    e.preventDefault()
    if (size.width <= 760 || size.height <= 640) setFullscreen(true)
    if (size.width > 760 && size.height > 640) setFullscreen(false)
    setPage('chat')
    currentChat.setCurrentChat(({
      name: chat.name, 
      roomId: chat.roomId, 
      members: chat.members,
      profile: chat.profile,
      disabled: chat.disabled,
      notActive: chat.notActive
    }))
  }

  const checkCount = chat => {
    const otherMessages = chat.messages.filter(msg => msg.from !== user.user.id).map(e => e.id)
    if (chat.roomId === currentChat.currentChat.roomId || otherMessages.length === 0) return false
    const countCondition = otherMessages.filter(msg => !chat.seen.includes(msg))?.length
    return countCondition > 0? true: false
  }

  const setNotifications = chat => {
    const otherMessages = chat.messages.filter(msg => msg.from !== user.user.id).map(e => e.id)
    const notifictions = otherMessages.filter(msg => !chat.seen.includes(msg))?.length
    return notifictions >= 9? '9+': notifictions
  }

  const getDateAndTime = date => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const givenDate = new Date(date)
    
    const isYesterday = new Date(d.toISOString()).toDateString() === new Date(date).toDateString()
    const isToday = new Date(new Date().toISOString()).toDateString() === new Date(date).toDateString()
    const today = `${givenDate.getMonth() + 1}/${givenDate.getDate()}/${givenDate.getFullYear()}`

    const hours = givenDate.getHours()
    const minutes = givenDate.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'

    hours = hours % 12;
    hours = hours ? hours : 12
    minutes = minutes < 10 ? `0${minutes}` : minutes
    const time = `${hours}:${minutes} ${ampm}`

    if (isToday) return {date: 'Today', time}
    if (isYesterday) return {date: 'Yesterday', time}
    else return {date: today, time}
  }

  const setLastChatMessage = chat => {
    const lastMessage = [...chat.messages].pop()

    if (lastMessage === undefined) return 

    const dateAndTime = getDateAndTime(lastMessage.date)
    return (
      <>
        <span>{lastMessage.data === undefined ? 'Image': lastMessage.data}</span>
        <span>{dateAndTime.date} at {dateAndTime.time}</span>
      </>
    )
  }

  return (
    <>
      <div className={styles['top-section']}>
        <div className={styles.search}>
          <BsSearch size={17} />
          <input type='text' placeholder='Search' onChange={e => setSearch(e.target.value)} />
        </div>
        <BsPencilSquare className={styles.icons}
          size={25} onClick={() => setShow(true)} 
        />
      </div>

      <div className={styles.chats}>
        {
          user.chats?.
          filter(chat => search !== ''? chat.name.toLowerCase().includes(search.toLowerCase()): chat).
          sort((a, b) => a.index - b.index).map(chat => (
            <div 
              className={styles.chat} key={chat.roomId} 
              onClick={e => selectChat(e, chat)}
              style={{backgroundColor: currentChat.currentChat.roomId === chat.roomId ? '#efefef': ''}}
            >
              <img src={chat.profile.pictureUrl} />
              <p className={styles['chat-name']}>{chat.name}</p>
              <p className={styles.notification} style={{display: checkCount(chat)? 'flex': 'none'}}>
                {setNotifications(chat)}
              </p>
              <p className={styles['chat-message']}>{setLastChatMessage(chat)}</p>
            </div>
          ))
        }
      </div>
    </>
  )
}

export default SidePannel