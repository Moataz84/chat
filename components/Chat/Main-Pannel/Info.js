import { useState } from 'react'
import { BsInfoCircleFill } from 'react-icons/bs'
import { v4 } from 'uuid'
import { useCurrentChat } from '../../../contexts/CurrentChatContext'
import UpdateGroup from './Info/UpdateGroup'
import EditChat from './Info/EditChat'
import Members from './Info/Members'
import { socket } from '../../../socket-client'
import { useUser } from '../../../contexts/UserContext'
import styles from '../../../styles/chat.module.css'
import AddMember from './Info/AddMember'

const Info = ({ setPage, showChatBox, setShowChatBox, showMember, setShowMember, setFullscreen }) => {

  const user = useUser()
  const currentChat = useCurrentChat()

  const [detail, setDetail] = useState('')

  const show = detail => {
    setDetail(detail)
    setShowChatBox(true)
  }

  const hide = () => {
    setDetail('')
    setShowChatBox(false)
  }

  const leaveChat = e => {
    e.preventDefault()
    socket.emit('leave-chat', {
      roomId: currentChat.currentChat.roomId,
      messageData: {
        id: v4(),
        type: 'alert',
        from: user.user.id,
        data: `${user.user.username} has left the chat.`,
        date: new Date().toISOString()
      }
    })
    currentChat.setCurrentChat({})
    setFullscreen(false)
    user.setChats(previous => previous.filter(chat => chat.roomId !== currentChat.currentChat.roomId))
  }

  return (
    <>
      { 
        showChatBox? 
          <UpdateGroup hide={hide} detail={detail} /> 
        : 
          <></> 
      }

      {
        showMember?
          <AddMember setShowMember={setShowMember} />
        :
          <></>
      }

      <div className={styles.details}>
        <p>Details</p>
        <BsInfoCircleFill size={23} className={styles.icons} onClick={() => setPage('chat')} />
      </div>

      <div className={styles['details-container']}>
        {
          currentChat.currentChat.members.length > 2?
            <EditChat show={show} />
          :
            <></>
        }
        <Members setShowMember={setShowMember} />
        <div className={styles.leave}>
          <p onClick={leaveChat}>Leave Chat</p>
        </div>
      </div>
    </>
  )
}

export default Info