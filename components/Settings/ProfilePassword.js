import { useState } from 'react'
import { useUser } from '../../contexts/UserContext'
import styles from '../../styles/settings.module.css'

const ProfileInformation = () => {

  const user = useUser()

  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [passwordType, setPasswordType] = useState(false)

  const [msg, setMsg] = useState('')

  const submit = async e => {
    e.preventDefault()
    if (password.length !== 0 && newPassword.length !== 0) {
      if (newPassword.length > 7 && !newPassword.includes(' ')) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/settings/update-password`, {
          method: 'POST',
          body: JSON.stringify({id: user.user.id, password, newPassword }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const data = await res.json()
        const msg = data.msg
        setMsg(msg)
        setPassword('')
        setNewPassword('')
      } else {
        setMsg('New Password must be at least 8 characters and can not include spaces.')
      }
    } else {
      setMsg('Both fields are required.')
    }
  }

  return (
    <form className={styles.form}>
      <label>Current Password</label>
      <input name='password' autoComplete='new-password' type={passwordType? 'text': 'password'} value={password}
        onChange={e => setPassword(e.target.value)} 
        onFocus={() => setMsg('')}
      />
      <label>New Password</label>
      <input name='password' type={passwordType? 'text': 'password'} value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        onFocus={() => setMsg('')}
      />
      <label>Show Passwords</label>
      <input name='password' className={styles.checkbox} type='checkbox' 
        onClick={() => setPasswordType(previous => !previous)}
      />
      <button onClick={submit}>Update</button>
      <p className={styles.msg} style={{color: msg === 'Password updated.'? '#000': ''}}>{msg}</p>
    </form>
  )
}

export default ProfileInformation