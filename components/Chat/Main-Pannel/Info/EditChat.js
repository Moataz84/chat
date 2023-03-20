import { AiOutlineCamera } from 'react-icons/ai'
import { IoPencilSharp } from 'react-icons/io5'
import { useCurrentChat } from '../../../../contexts/CurrentChatContext'
import styles from '../../../../styles/chat.module.css'

const EditChat = ({ show }) => {
  const currentChat = useCurrentChat()

  return (
    <div className={styles['group-properties']}>
      <img src={currentChat.currentChat.profile.pictureUrl} />
      <div className={styles.cover} onClick={() => show('Group Profile Picture')}>
        <AiOutlineCamera size={24} className={styles.icon} />
      </div>
      <div className={styles['edit-name']}>
        <p>{currentChat.currentChat.name}</p>
        <IoPencilSharp size={17} className={styles.icons} onClick={() => show('Group Name')} />
      </div>
    </div>
  )
}

export default EditChat