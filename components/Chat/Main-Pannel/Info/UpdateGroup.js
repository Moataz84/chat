import { useState, useRef, useEffect } from 'react'
import { IoCloudUploadOutline } from 'react-icons/io5'
import { CgClose } from 'react-icons/cg'
import { v4 } from 'uuid'
import { useUser } from '../../../../contexts/UserContext'
import { useCurrentChat } from '../../../../contexts/CurrentChatContext'
import getDataUrl from '../../../../functions/convert-to-dataurl'
import { socket } from '../../../../socket-client'
import styles from '../../../../styles/chat.module.css'

const UpdateGroup = ({ hide, detail }) => {

  const user = useUser()

  const currentChat = useCurrentChat()
  
  const [name, setName] = useState(currentChat.currentChat.name)

  const inputRef = useRef()
  const [fileName, setFileName] = useState('Upload File')

  const [error, setError] = useState('')

  useEffect(() => {
    setName(currentChat.currentChat.name)
  }, [currentChat.currentChat])

  const saveName = e => {
    e.preventDefault()
    if (name !== '') {
      socket.emit(
        'name-update', 
        {
          name, 
          roomId: currentChat.currentChat.roomId, 
          messageData: {
            id: v4(),
            type: 'alert',
            data: `${user.user.username} changed the group name to ${name}.`,
            date: new Date().toISOString()
          },
          members: currentChat.currentChat.members.map(member => member.id)
        }
      )
      hide()
    } else {
      setError('Group name can not be empty.')
    }
  }

  const savePicture = async e => {
    e.preventDefault()
    const file = inputRef.current.files[0]
    if (file !== undefined) {
      const fileType = file.type
      if (fileType.includes('image')) {
        if (file.size < 2 * 1024 * 1024) {
          const dataUrl = await getDataUrl(file)
          socket.emit(
            'profile-update', 
            {
              roomId: currentChat.currentChat.roomId, 
              dataUrl, 
              extension: name.split('.').pop(),
              messageData: {
                id: v4(),
                type: 'alert',
                data: `${user.user.username} changed the group profile picture.`,
                date: new Date().toISOString()
              },
              members: currentChat.currentChat.members.map(member => member.id)
            }
          )
          hide()
          inputRef.current = ''
          setFileName('')
        } else {
          setError('File size must be less than 2MB.')
        }
      } else {
        setError('Please select an image file.')
      }
    } else {
      setError('Please choose a file.')
    }
  }

  return (
    <div className={styles['edit-chat-box']}>
      <div>
        <p>{detail}</p>
        <CgClose className={styles.icons} size={25} onClick={hide} />
      </div>

      <form>
        {
          detail === 'Group Profile Picture' ?
            <>
              <input 
                type='file' 
                id='upload-file' 
                ref={inputRef} 
                onFocus={() => setError('')}
                onChange={e => 
                  setFileName(e.target.files[0] === undefined ? 'Upload File': e.target.files[0].name)
                }
              />
              <label htmlFor='upload-file'>
                <IoCloudUploadOutline size={21} />
                <p>{fileName}</p>
              </label>
            </>
          :
            <input 
              type='text' 
              placeholder='Group Name'
              value={name}
              onChange={e => setName(e.target.value)} 
              onFocus={() => setError('')}
            />
        }
        <button 
          onClick={detail === 'Group Profile Picture'? savePicture: saveName} className={styles}
        >Save</button>
      </form>
      <p>{error}</p>
    </div>
  )
}

export default UpdateGroup