import { useState, useRef, useEffect } from 'react'
import { IoSendSharp } from 'react-icons/io5'
import { BiImage } from 'react-icons/bi'
import { v4 } from 'uuid'
import { useUser } from '../../../../contexts/UserContext'
import { useCurrentChat } from '../../../../contexts/CurrentChatContext'
import getDataUrl from '../../../../functions/convert-to-dataurl'
import { socket } from '../../../../socket-client'
import styles from '../../../../styles/chat.module.css'

const SendMessage = () => {

  const user = useUser()
  
  const currentChat = useCurrentChat()

  const inputRef = useRef()

  const textareaRef = useRef()

  const [message, setMessage] = useState('')

  useEffect(() => {
    setMessage('')
  }, [currentChat.currentChat])

  const sendMessage = e => {
    e.preventDefault()
    if (message.length === 0) return

    const messageData = {
      id: v4(), 
      type: 'message',
      from: user.user.id, 
      data: message,
      date: new Date().toISOString()
    }

    socket.emit('send-message', { 
      roomId: currentChat.currentChat.roomId, 
      messageData,
      members: currentChat.currentChat.members.map(member => member.id) 
    })

    setMessage('')
    textareaRef.current.style.height = `20px`
  }

  const sendImage = async e => {
    e.preventDefault()
    const file = e.target.files[0]
    if (file && file.type.includes('image') && file.size < 1024 * 1024 * 5) {
      const dataUrl = await getDataUrl(file)
      const messageData = {
        id: v4(),
        type: 'message',
        dataUrl,
        extension: file.name.split('.').pop(),
        from: user.user.id,
        date: new Date().toISOString()
      }

      socket.emit('send-image', { 
        roomId: currentChat.currentChat.roomId, 
        messageData,
        members: currentChat.currentChat.members.map(member => member.id) 
      })

      inputRef.current.value = ''
    }
  }

  return (
    <div className={styles['send-message']}>
      <input 
        type='file' 
        id='image-file-send' 
        ref={inputRef} 
        onChange={sendImage} 
      />
      <label htmlFor='image-file-send'>
        <BiImage size={25} className={styles.icons} />
      </label>
      <textarea type='text' value={message} ref={textareaRef} placeholder='Message'
        onChange={e => {
          e.target.style.height = '1px'
          e.target.style.height = `${e.target.scrollHeight - 12}px`
          setMessage(e.target.value)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') sendMessage(e)
        }}
      />
      {
        message.length > 0?
          <IoSendSharp 
            size={22} 
            className={styles.icons} 
            onClick={sendMessage} 
          />
        :
          <></>
      }
    </div>
  )
}

export default SendMessage