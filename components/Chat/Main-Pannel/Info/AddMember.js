import { useState } from 'react'
import { CgClose } from 'react-icons/cg'
import { BsArrowLeft } from 'react-icons/bs'
import { v4 } from 'uuid'
import { useSize } from '../../../../contexts/ScreeSizeContext'
import { useCurrentChat } from '../../../../contexts/CurrentChatContext'
import { useUser } from '../../../../contexts/UserContext'
import { socket } from '../../../../socket-client'
import styles from '../../../../styles/chat.module.css'

const AddMember = ({ setShowMember }) => {

  const size = useSize()

  const user = useUser()

  const currentChat = useCurrentChat()

  const groupMembers = currentChat.currentChat.members.
  filter(member => !currentChat.currentChat.notActive.includes(member.id)).map(m => m.id)

  const [selectedFriends, setSelected] = useState(
    user.user.friends.filter(friend => groupMembers.includes(friend.id) === false).
    map(friend => ({...friend, selected: false}))
  )

  const setSelectedFriend = id => {
    setSelected(previous => {
      const person = previous.find(person => person.id === id)
      person.selected = !person.selected
      return [...previous]
    })
  }

  const save = () => {
    const newMembers = selectedFriends.filter(friend => friend.selected)
    if (newMembers.length > 0) {
      newMembers.forEach(member => {
        
        const groupMembers = currentChat.currentChat.members
        const notActiveMembers = currentChat.currentChat.notActive

        const members = groupMembers.map(m => m.id).includes(member.id)? groupMembers: [...groupMembers, member]
        const notActive = !notActiveMembers.includes(member.id)? notActiveMembers: 
        notActiveMembers.filter(m => m !== member.id)

        const name = members.length > 2? members.map(m => m.username).toString().replaceAll(',', ', '): 
        user.user.name
        const profile = members.length > 2? 
        {
          pictureUrl: 'https://ik.imagekit.io/pk4i4h8ea/chat-website/chats/group-profiles/group-default_8_8jQi9K5.jpg',
          pictureId: '62d9850dda2224c770a47907'
        }: 
        user.user.profile

        const messageData = {
          id: v4(),
          type: 'alert',
          data: `${user.user.username} has added ${member.username}.`,
          date: new Date().toISOString()
        }

        socket.emit('add-member', {
          chat: {
            index: 0,
            roomId: currentChat.currentChat.roomId,
            name,
            members,
            notActive,
            profile,
            messages: [...user.chats.find(c => c.roomId === currentChat.currentChat.roomId).messages, messageData],
            disabled: false
          },
          messageData,
          member: member.id,
          newMember: members.length > 2? true: false
        })
      })
    }
    setShowMember(false)
  }

  return (
    <div className={styles['add-members']}>
      <div>
        {
          size.width > 760 || size.height  < 640?
            <CgClose className={styles.icons} size={25} onClick={() => setShowMember(false)} />
          :
            <BsArrowLeft className={styles.icons} size={25} onClick={() => setShowMember(false)} />
        }
        <p>Add Members</p>
        <p onClick={save}>Save</p>
      </div>
      <div>
        <p>Choose Friends</p>
        {
          selectedFriends.map(friend => (
            <div key={friend.id} className={styles.friend}     
              onClick={() => setSelectedFriend(friend.id)}
            >
              <img src={friend.profile?.pictureUrl} />
              <p>{friend.username}</p>
              <input type='radio' 
                checked={selectedFriends.find(person => person.id === friend.id).selected}
                onChange={() => {}}
              />
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default AddMember