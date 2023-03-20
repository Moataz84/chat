import { IoPaperPlaneOutline } from 'react-icons/io5'
import { useCurrentChat } from '../../contexts/CurrentChatContext'
import Chats from './Main-Pannel/Chats'
import Info from './Main-Pannel/Info'
import styles from '../../styles/chat.module.css'

const MainPannel = ({ 
  page, setPage, 
  showChatBox, setShowChatBox, 
  showImage, setShowImage, 
  showMember, setShowMember, setFullscreen
}) => {

  const currentChat = useCurrentChat()

  return (
    <>
      {
        currentChat.currentChat.roomId !== undefined?
          page === 'chat'?
            <Chats 
              setPage={setPage} 
              showImage={showImage} 
              setShowImage={setShowImage} 
            />
          :
            <Info 
              setPage={setPage} 
              showChatBox={showChatBox} 
              setShowChatBox={setShowChatBox} 
              showMember={showMember}
              setShowMember={setShowMember}
              setFullscreen={setFullscreen}
            />
        :
          <div className={styles['empty-chat']}>
            <div className={styles.circle}>
              <IoPaperPlaneOutline size={60} />
            </div>
            <h2>Messages</h2>
            <p>Here, you will find your chats with friends and groups.</p>
          </div>
      }
    </>
  )
}

export default MainPannel