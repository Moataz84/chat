import { useState } from 'react'
import { BsCheck2 } from 'react-icons/bs'
import { CgClose } from 'react-icons/cg'
import DisplayUsers from '../DisplayUsers'
import Serach from '../Search'
import generateCards from '../../../functions/generate-cards'
import { useUser } from '../../../contexts/UserContext'
import { useSize } from '../../../contexts/ScreeSizeContext'
import { socket } from '../../../socket-client'
import { acceptRequest, declineRequest } from '../../../functions/friends'
import styles from '../../../styles/friends.module.css'

const ButtonConfiguration = ({ person, user }) => {
  const size = useSize()

  return (
    <>
      {
        size > 760?
          <>
            <button onClick={e => acceptRequest(e, person, user, socket)}>Accept</button>
            <button className={styles.other} onClick={e => declineRequest(e, person.id, user, socket)}>Decline</button>
          </>
        :
          <div>
            <BsCheck2 size={24} onClick={e => acceptRequest(e, person, user, socket)} />
            <CgClose size={22} onClick={e => declineRequest(e, person.id, user, socket)} />
          </div>
      }
    </>
  )
}

const FriendRequests = ({ setPage }) => {

  const user = useUser()

  const [search, setSearch] = useState('')
  const [searchedUsers, setSearchedUsers] = useState([])


  const searchUser = e => {
    e.preventDefault()
    if (search.length !== 0) {
      const result = user.user.requested.filter(
        user => user.username.toLowerCase().includes(search.toLowerCase())
      )
      setSearchedUsers(result.length === 0? [{username: 'not found'}]: result)
    }
  }

  return (
    <>
      <div className={styles.ribbon}>
        <h2>Friend Requests</h2>
        <Serach 
          search={search} 
          setSearch={setSearch} 
          setSearchedUsers={setSearchedUsers} 
          searchUser={searchUser}
          loading={false}
        />
        <p className={styles['change-form']} onClick={() => setPage('friend-requests-sent')}>View Sent Requests</p>
      </div>

      <div className={styles.users} style={{display: searchedUsers.length > 0? 'grid': 'none'}}>
        <DisplayUsers users={searchedUsers} ButtonConfiguration={ButtonConfiguration} />
      </div>

      <div className={styles.users} style={{display: searchedUsers.length > 0? 'none': 'grid'}}>
        {user.loading? generateCards(3): ''}
        <DisplayUsers users={user.user.requested} ButtonConfiguration={ButtonConfiguration} />
      </div>

      <div style={{display: searchedUsers.length > 0? 'none': 'grid'}}>
        { user.user.requested?.length === 0? <p >You have no friend requests.</p>: '' }
      </div>
    </>
  )
}

export default FriendRequests