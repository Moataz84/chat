import { useState } from 'react'
import Link from 'next/link'
import { MdLogout } from 'react-icons/md'
import { 
  BsThreeDots, 
  BsFillChatDotsFill, 
  BsPeopleFill,
  BsPersonPlusFill,
  BsFillPersonLinesFill,
  BsFillGearFill,
} from 'react-icons/bs'
import { useUser } from '../contexts/UserContext'
import styles from '../styles/main.module.css'

const Menu = ({ router }) => {

  const user = useUser()

  const profile = user.user.profile?.pictureUrl
  const pathname = router.pathname
  
  const [loaded, setLoaded] = useState(false)
  const checkLoaded = () =>  setLoaded(true)

  const logout = async e => {
    e.preventDefault()
    await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/auth/logout`, {
      method: 'POST'
    })
    await router.push('/login')
    await user.setLoggedIn(false)
  }

  const notifications = user.chats.map(chat => {
    const otherMessages = chat.messages.filter(msg => msg.from !== user.user.id).map(e => e.id)
    return otherMessages.filter(msg => !chat.seen.includes(msg))?.length
  }).filter(n => n > 0).length

  return (
    <div className={styles.menu}>
      <div className={styles['top-section']}>
        <BsThreeDots />
        {
          profile !== undefined? <img onLoad={checkLoaded} src={profile} />: ''
        }
        <div className={styles.load} style={{display: loaded? 'none': 'block'}} />
      </div>

      <div className={styles.navigation}>
        <Link href='/'>
          <a className={pathname === '/'? styles.entered: ''}>
            <BsFillChatDotsFill className={styles.icons} />
            {
              notifications !== 0?        
                <div className={styles.notification}>
                  {notifications >= 9? '9+': notifications}
                </div>
              :
                <></>
            }
          </a>
        </Link>

        <Link href='/find-friends'>
          <a className={pathname === '/find-friends'? styles.entered: ''}>
            <BsPeopleFill className={styles.icons} />
          </a>
        </Link> 


        <Link href='/friend-requests'>
          <a className={pathname === '/friend-requests'? styles.entered: ''}>
            <BsPersonPlusFill className={styles.icons} />
            {
              pathname !== '/friend-requests' && user.requestNotifications > 0?
                <div className={styles.notification}>
                    {user.requestNotifications >= 9? '9+': user.requestNotifications}
                </div>
              :
                <></>
            }
          </a>
        </Link>

        <Link href='/friends'>
          <a className={pathname === '/friends'? styles.entered: ''}>
            <BsFillPersonLinesFill className={styles.icons} />
          </a>
        </Link>

        <Link href='/settings'>
          <a className={pathname === '/settings'? styles.entered: ''}>
            <BsFillGearFill className={styles.icons} />
          </a>
        </Link>
      </div>

      <a className={styles.logout} onClick={logout}>
        <MdLogout className={styles.icons} />
      </a>
    </div>
  )
}

export default Menu