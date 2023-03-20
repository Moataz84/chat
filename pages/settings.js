import { useState } from 'react'
import { useRouter } from 'next/router'
import { CgClose } from 'react-icons/cg'
import Head from 'next/head'
import { v4 } from 'uuid'
import { useUser } from '../contexts/UserContext'
import { socket } from '../socket-client'
import Loading from '../components/Loading'
import ProfilePicture from '../components/Settings/ProfilePicture'
import ProfileInformation from '../components/Settings/ProfileInformation'
import ProfilePassword from '../components/Settings/ProfilePassword'
import styles from '../styles/settings.module.css'

const Settings = () => {

  const [show, setShow] = useState(false)

  const user = useUser()

  const router = useRouter()

  const logout = async e => {
    e.preventDefault()
    await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/auth/logout`, {
      method: 'POST'
    })
    await router.push('/login')
    await user.setLoggedIn(false)
  }

  const deleteAccount = async e => {
    e.preventDefault()
    socket.emit('delete-account', {
      messageData: {
        id: v4(),
        type: 'alert',
        from: user.user.id,
        data: `${user.user.username} has left the chat.`
      },
      chats: user.chats.map(c => c.roomId),
      friends: user.user.friends.map(f => f.id),
      requests: user.user.requests.map(req => req.id),
      requested: user.user.requested.map(req => req.id)
    })
    await logout()
  }
  
  return ( 
    <div className={styles.container}>
      <Head>
        <title>Settings</title>
      </Head>
      {
        user.laoding?
          <Loading />
        :
          <>
            <div className={styles.unresponsive} style={{display: show? 'block': 'none'}} />
            {
              show? 
                <div className={styles.confirm}>
                  <p>Delete Account</p>
                  <CgClose size={24} className={styles.icon} onClick={() => setShow(false)} />
                  <p>Are you sure you want to delete your account? This action is irreversible.</p>
                  <div>
                    <button onClick={deleteAccount}>Confirm</button>
                    <button onClick={() => setShow(false)}>Cancel</button>
                  </div>
                </div>
              :
                ''
            }
            <h2>Settings</h2>
            <ProfilePicture/>
            <ProfileInformation/>
            <ProfilePassword/>
            <button onClick={logout}>Logout</button>
            <button onClick={() => setShow(true)}>Delete Account</button>
          </>
      }
    </div>
  )
}


export default Settings