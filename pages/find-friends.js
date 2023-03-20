import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { BsPersonPlusFill, BsCheck2, BsPersonXFill, BsPersonDashFill } from 'react-icons/bs'
import { CgClose } from 'react-icons/cg'
import DisplayUsers from '../components/Friends/DisplayUsers'
import Serach from '../components/Friends/Search'
import generateCards from '../functions/generate-cards'
import { useUser } from '../contexts/UserContext'
import { useUsers } from '../contexts/UsersContext'
import { useSize } from '../contexts/ScreeSizeContext'
import { 
  sendFriendRequest, 
  removeFriendRequest, 
  removeFriend,
  acceptRequest,
  declineRequest
} from '../functions/friends'
import { socket } from '../socket-client'
import styles from '../styles/friends.module.css'

const ButtonConfiguration = ({ user, person }) => {
  const size = useSize()
  
  return (
    <>
      {
        user.user.friends?.find(friend => friend.id === person.id) === undefined?
          user.user.requested?.find(request => request.id === person.id) === undefined?
            user.user.requests?.find(request => request.id === person.id) === undefined?
              size.width > 760?
                <button onClick={e => sendFriendRequest(e, person, user, socket)}>Send Request</button>
              :
                <BsPersonPlusFill size={24} onClick={e => sendFriendRequest(e, person, user, socket)} />
            :
              size.width > 760?
                <button className={styles.other} onClick={e => removeFriendRequest(e, person.id, user, socket)}>Remove Request</button>
              :
                <BsPersonXFill size={24} onClick={e => removeFriendRequest(e, person.id, user, socket)} />
          :
          size.width > 760?
            <>
              <button onClick={e => acceptRequest(e, person, user, socket)}>Accept</button>
              <button className={styles.other} onClick={e => declineRequest(e, person.id, user, socket)}>Decline</button>
            </>
          :
            <div>
              <BsCheck2 size={24} onClick={e => acceptRequest(e, person, user, socket)} />
              <CgClose size={22} onClick={e => declineRequest(e, person.id, user, socket)} />
            </div>
        :
          size.width > 760?
            <button className={styles.other} onClick={e => removeFriend(e, person.id, user, socket)}>Remove Friend</button>
          :
            <BsPersonDashFill size={24} onClick={e => removeFriend(e, person.id, user, socket)} />
      }
    </>
  )
}

const FindFriends = () => {

  const [search, setSearch] = useState('')
  const [searchedUsers, setSearchedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  
  const user = useUser()
  const users = useUsers()

  const divRef = useRef()
  const observerRef = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const intersecting = entries[0].isIntersecting
      if (intersecting) {
        users.getUsers()
        observer.unobserve(entries[0].target)
      }
    }, {
      threshold: 1,
    })
    observerRef.current = observer

    if (!users.loading) {
      if (users.users.length !== 0) observer.observe(divRef.current.lastElementChild)
    }
  }, [users.loading])

  const searchUser = async e => {
    e.preventDefault()
    setLoading(true)
    if (search.length !== 0) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/friends/get-requested-user`, {
        method: 'POST',
        body: JSON.stringify({search, username: user.user.username }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      const users = data.users
      setSearchedUsers(users.length === 0? [{username: 'not found'}]: users)
    }
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Find Friends</title>
      </Head>

      <div className={styles.ribbon}>
        <h2>Find Friends</h2>
        <Serach 
          search={search} 
          setSearch={setSearch} 
          setSearchedUsers={setSearchedUsers} 
          searchUser={searchUser}
          loading={loading}
        />
      </div>

      <div className={styles.users} style={{display: searchedUsers.length > 0? 'grid': 'none'}}>
        <DisplayUsers users={searchedUsers} ButtonConfiguration={ButtonConfiguration} />
      </div>

      <div className={styles.users} ref={divRef} 
        style={{display: searchedUsers.length > 0? 'none': 'grid'}}
      >
        <DisplayUsers users={users.users} ButtonConfiguration={ButtonConfiguration} />
        {users.loading? generateCards(2): ''}
      </div>
    </div>
  )
}

export default FindFriends