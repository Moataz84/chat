import { useState, useRef } from 'react'
import { AiOutlineCamera } from 'react-icons/ai'
import { useUser } from '../../contexts/UserContext'
import getDataUrl from '../../functions/convert-to-dataurl'
import styles from '../../styles/settings.module.css'

const ProfilePicture = () => {

  const user = useUser()

  const inputRef = useRef()
  const imageRef = useRef()
  const [profileError, setProfileError] = useState(false)

  const updateProfile = async e => {
    e.preventDefault()
    const file = inputRef.current.files[0]
    if (file !== undefined) {
      const fileType = file.type
      if (fileType.includes('image')) {
        if (file.size < 2 * 1024 * 1024) {
          const dataUrl = await getDataUrl(file)
          user.setUser(previous => ({...previous, profile: {pictureId: '', pictureUrl: dataUrl}}))
          await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/settings/update-profile`, {
            method: 'POST',
            body: JSON.stringify({
              dataUrl, id: user.user.id, 
              extension: file.name.split('.').pop()
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          })
        } else {
          setProfileError('File must be less than 2MB.')
        }
      } else {
        setProfileError('This is not a supported image file.')
      }
    } else {
      setProfileError('No file selected.')
    }
  }

  return (
    <div className={styles['update-profile']}>
      <img src={user.user.profile?.pictureUrl} ref={imageRef} />
      <div className={styles.cover} onClick={() => {
        inputRef.current.click()
        setProfileError('')
      }}>
        <AiOutlineCamera size={24} className={styles.icon} />
      </div>
      <input type='file' style={{display: 'none'}} ref={inputRef} />
      <button onClick={updateProfile}>Update Profile</button>
      <p className={styles.error}>{profileError}</p>
  </div>
  )
}

export default ProfilePicture