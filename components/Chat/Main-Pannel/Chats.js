import { useState } from 'react'
import { BsInfoCircle } from 'react-icons/bs'
import { BsSearch } from 'react-icons/bs'
import { useUser } from '../../../contexts/UserContext'
import { useCurrentChat } from '../../../contexts/CurrentChatContext'
import ImageViewer from './Chats/ImageViewer'
import Messages from './Chats/Messages'
import SendMessage from './Chats/SendMessage'
import styles from '../../../styles/chat.module.css'

const Chats = ({ setPage, showImage, setShowImage }) => {

  const currentChat = useCurrentChat()

  const [search, setSearch] = useState('')

  const [image, setImage] = useState('')

  return (
    <>
      {
        showImage?
          <ImageViewer image={image} setShowImage={setShowImage} />
        :
          <></>
      }

      <div className={styles['chat-info']}>
        <div className={styles['chat-details']}>
          <img src={currentChat.currentChat.profile.pictureUrl} />
          <p>{currentChat.currentChat.name}</p>
        </div>
        <BsInfoCircle size={23} className={styles.icons} onClick={() => setPage('info')} />
      </div>

      <div className={styles['messages-container']}>
        <div className={styles['chat-search']}>
          <BsSearch size={20} />
          <input type='text' placeholder='Search' onChange={e => setSearch(e.target.value)} />
        </div>
        <Messages search={search} setImage={setImage} setShowImage={setShowImage} />
        {
          currentChat.currentChat.disabled === false?
            <SendMessage />
          :
            <></>
        }
      </div>
    </>
  )
}

export default Chats