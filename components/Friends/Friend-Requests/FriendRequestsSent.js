import { useState } from 'react'
import { BsPersonXFill } from 'react-icons/bs'
import DisplayUsers from '../DisplayUsers'
import Serach from '../Search'
import generateCards from '../../../functions/generate-cards'
import { useUser } from '../../../contexts/UserContext'
import { useSize } from '../../../contexts/ScreeSizeContext'
import { socket } from '../../../socket-client'
import { removeFriendRequest } from '../../../functions/friends'
import styles from '../../../styles/friends.module.css'

const ButtonConfiguration = ({ person, user }) => {
  const size = useSize()

  return (
    <>
      {
        size.width > 760?
          <button className={styles.other} onClick={e => removeFriendRequest(e, person.id, user, socket)}>Remove Request</button>
        :
          <BsPersonXFill size={24} onClick={e => removeFriendRequest(e, person.id, user, socket)} />
      }
    </>
  )
}

const FriendRequestsSent = ({ setPage }) => {

  const user = useUser()

  const [search, setSearch] = useState('')
  const [searchedUsers, setSearchedUsers] = useState([])

  const searchUser = e => {
    e.preventDefault()
    if (search.length !== 0) {
      const result = user.user.requests.filter(
        user => user.username.toLowerCase().includes(search.toLowerCase())
      )
      setSearchedUsers(result.length === 0? [{username: 'not found'}]: result)
    }
  }

  return (
    <>
      <div className={styles.ribbon}>
        <h2>Friend Requests Sent</h2>
        <Serach 
          search={search} 
          setSearch={setSearch} 
          setSearchedUsers={setSearchedUsers} 
          searchUser={searchUser}
          loading={false}
        />
        <p className={styles['change-form']} onClick={() => setPage('friend-requests')}>View Friend Requests</p>
      </div>

      <div className={styles.users} style={{display: searchedUsers.length > 0? 'grid': 'none'}}>
        <DisplayUsers users={searchedUsers} ButtonConfiguration={ButtonConfiguration} />
      </div>

      <div className={styles.users} style={{display: searchedUsers.length > 0? 'none': 'grid'}}>
        {user.loading? generateCards(3): ''}
        <DisplayUsers users={user.user.requests} ButtonConfiguration={ButtonConfiguration} />
      </div>
      
      <div style={{display: searchedUsers.length > 0? 'none': 'grid'}}>
        { user.user.requests?.length === 0? <p >You have not sent any friend requests.</p>: '' }
      </div>
    </>
  )
}

export default FriendRequestsSent