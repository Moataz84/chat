import React from 'react'
import { useCurrentChat } from '../../../../contexts/CurrentChatContext'
import styles from '../../../../styles/chat.module.css'

const Members = ({ setShowMember }) => {

  const currentChat = useCurrentChat()

  const show = () => setShowMember(true)

  return (
    <div className={styles.members}>
      <p>Members</p>
      <p className={styles['add-member']} onClick={show}>Add Member</p>
      {
        currentChat.currentChat.members.
        filter(member => !currentChat.currentChat.notActive.includes(member.id)).
        map(member => (
          <div className={styles.member} key={member.id}>
            <img src={member.profile.pictureUrl} />
            <p>{member.username}</p>
          </div>
        ))
      }
    </div>
  )
}

export default Members