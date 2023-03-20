import { useState, useRef, useEffect } from 'react'
import { v4 } from 'uuid'
import { CgClose } from 'react-icons/cg'
import { BsArrowLeft } from 'react-icons/bs'
import { useUser } from '../../contexts/UserContext'
import { useSize } from '../../contexts/ScreeSizeContext'
import { useCurrentChat } from '../../contexts/CurrentChatContext'
import { socket } from '../../socket-client'
import equalsIgnoreOrder from '../../functions/compare-array'
import styles from '../../styles/chat.module.css'

const CreateChat = ({ setShow, setFullscreen }) => {

  const size = useSize()

  const user = useUser()

  const currentChat = useCurrentChat()

  const [groupName, setGroupName] = useState('')
  const [suggestedGroupName, setSuggestedGroupName] = useState('')
  const inputRef = useRef()

  const [search, setSearch] = useState('')

  const [selectedFriends, setSelected] = useState(
    [...user.user.friends].map(friend => ({...friend, selected: false}))
  )

  useEffect(() => {
    const groupUsers = selectedFriends.filter(friend => friend.selected).length > 1?
      [user.user, ...selectedFriends.filter(friend => friend.selected)]
    :
      selectedFriends.filter(friend => friend.selected)
    const name = groupUsers.map(friend => friend.username)
    .toString().replace(/,/g, ', ')
    setSuggestedGroupName(name)
  }, [selectedFriends])

  const setSelectedFriends = id => {
    const person = selectedFriends.find(person => person.id === id)
    const updatedPerson = {...person, selected: !person.selected}
    setSelected([...selectedFriends.filter(friend => friend.id !== id), updatedPerson])
  }

  const save = async e => {
    e.preventDefault()

    const selected = [{...user.user}, ...selectedFriends.filter(friend => friend.selected)].
    map(p => ({
      id: p.id,
      username: p.username,
      profile: p.profile
    }))

    if (selected.length === 1) {
      setShow(false)
      return
    }

    const members = selected.map(friend => friend.id)
    const roomId = `${v4()}-${v4()}`

    const exists = user.chats.map(chat => chat.members.map(i => i.id))
    
    if (exists.some(m => equalsIgnoreOrder(m, members)) === false || members.length > 2) {
      const messageData = {
        id: v4(),
        type: 'alert',
        data: `${user.user.username} created a new chat.`,
        from: user.user.id,
        date: new Date().toISOString()
      }
      const stateChat = {
        index: 0,
        roomId, 
        members: selected,
        name: inputRef.current.value,
        profile: {
          pictureId: members.length > 2? '62d9850dda2224c770a47907'
          :
          selectedFriends.find(friend => friend.selected).profile.pictureId
          ,
          pictureUrl: members.length > 2? 
            'https://ik.imagekit.io/pk4i4h8ea/chat-website/chats/group-profiles/group-default_8_8jQi9K5.jpg'
          :
            selectedFriends.find(friend => friend.selected).profile.pictureUrl
        },
        messages: [messageData],
        disabled: false,
        notActive: []
      }
      user.setChats(previous => ([stateChat, ...previous.map(chat => ({...chat, index: chat.index + 1}))]))
  
      const chat = {
        name: members.length > 2? inputRef.current.value: '',
        roomId,
        profile: {
          pictureUrl: members.length > 2? 
            'https://ik.imagekit.io/pk4i4h8ea/chat-website/chats/group-profiles/group-default_8_8jQi9K5.jpg'
          :
            '',
          pictureId: members.length > 2? '62d9850dda2224c770a47907': ''
        },
        members,
        messages: [messageData],
        disabled: false,
        notActive: []
      }
  
      const userStateChat = {
        index: 0,
        roomId, 
        members: selected,
        name: members.length > 2? inputRef.current.value : user.user.username,
        profile: {
          pictureId: members.length > 2? '62d9850dda2224c770a47907'
          :
          user.user.profile.pictureId
          ,
          pictureUrl: members.length > 2? 
            'https://ik.imagekit.io/pk4i4h8ea/chat-website/chats/group-profiles/group-default_8_8jQi9K5.jpg'
          :
            user.user.profile.pictureUrl
        },
        messages: [messageData],
        disabled: false,
        notActive: []
      }

      socket.emit('create-chat', { 
        ids: selectedFriends.filter(friend => friend.selected).map(friend => friend.id), 
        chat, 
        stateChat: userStateChat 
      })
    } else {
      const foundChat = user.chats.find(chat => equalsIgnoreOrder(chat.members.map(member => member.id), members))
      currentChat.setCurrentChat(({
        name: foundChat.name, 
        roomId: foundChat.roomId, 
        members: foundChat.members,
        profile: foundChat.profile,
        disabled: foundChat.disabled,
        notActive: foundChat.notActive
      }))
      setFullscreen(true)
    }
    setShow(false)
  }
  
  return (
    <div className={styles['create-chat']}>
      <div>
        {
          size.width > 760 || size.height < 640?
            <CgClose className={styles.icons} size={25} onClick={() => setShow(false)} />
          :
            <BsArrowLeft className={styles.icons} size={25} onClick={() => setShow(false)} />
        }
        <p>New message</p>
        <p onClick={save}>Save</p>
      </div>

      <input type='text' placeholder='Group Name' ref={inputRef}
        value={
          selectedFriends.filter(friend => friend.selected).map(friend => friend.username).length <= 1?
            suggestedGroupName
          :
            groupName === ''? suggestedGroupName: groupName
          }
        disabled={
          selectedFriends.filter(friend => friend.selected).map(friend => friend.username).length > 1?
            false
          :
            true
        }
        onChange={e => {
          setSuggestedGroupName(e.target.value)
          setGroupName(e.target.value)
        }}
      />
      <input type='text' placeholder='Search Friend' value={search} 
        onChange={e => setSearch(e.target.value)}
      />

      <div>
        <p>Choose Friends</p>
        {
          user.user.friends?.
          filter(friend => search !== ''? friend.username.toLowerCase().includes(search.toLowerCase()): friend).
          map(friend => (
            <div key={friend.id} className={styles.friend}     
              onClick={() => setSelectedFriends(friend.id)}
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

export default CreateChat