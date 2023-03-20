import { useState, useEffect } from 'react'
import { useUser } from '../../contexts/UserContext'
import styles from '../../styles/settings.module.css'

const ProfileInformation = () => {

  const user = useUser()

  const [username, setUsername] = useState('')

  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (user.user.username !== undefined) {
      setUsername(user.user.username)
    }
  }, [user.user])

  const submit = async e => {
    e.preventDefault()
    if (username.toLowerCase() !== user.user.username.toLowerCase()) {
      if (username.length !== 0) {
        if (username.length > 3 && !username.includes(' ')) {
          user.setUser(previos => ({...previos, username}))
          const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/settings/update-username`, {
            method: 'POST',
            body: JSON.stringify({id: user.user.id, username }),
            headers: {
              'Content-Type': 'application/json'
            }
          })
          const data = await res.json()
          const msg = data.msg
          setMsg(msg)
        } else {
          setMsg('Username must contain atleast 4 characters and can not include spaces.')
        }
      } else {
        setMsg('Username cannot be empty.')
      }
    } else {
      setMsg('No changes were made.')
    }
  }

  return (
    <form className={styles.form} >
      <label>Username</label>
      <input type='text' value={username} name='username'
        onChange={e => setUsername(e.target.value)}
        onFocus={() => setMsg('')}
      />
      <button onClick={submit}>Update</button>
      <p className={styles.msg} style={{color: msg === 'Username updated.'? '#000': ''}}>{msg}</p>
    </form>
  )
}

export default ProfileInformation