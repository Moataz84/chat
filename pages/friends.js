import { useState } from 'react'
import Head from 'next/head'
import { BsPersonDashFill } from 'react-icons/bs'
import DisplayUsers from '../components/Friends/DisplayUsers'
import Serach from '../components/Friends/Search'
import generateCards from '../functions/generate-cards'
import { useSize } from '../contexts/ScreeSizeContext'
import { useUser } from '../contexts/UserContext'
import { socket } from '../socket-client'
import { removeFriend } from '../functions/friends'
import styles from '../styles/friends.module.css'

const ButtonConfiguration = ({ person, user }) => {
  const size = useSize()
  
  return (
    <>
      {
        size.width > 760?
          <button className={styles.other} onClick={e => removeFriend(e, person.id, user, socket)}>Remove Friend</button>
        :
          <BsPersonDashFill size={24} onClick={e => removeFriend(e, person.id, user, socket)} />
      }
    </>
  )
}

const Friends = () => {

  const user = useUser()

  const [search, setSearch] = useState('')
  const [searchedUsers, setSearchedUsers] = useState([])

  const searchUser = e => {
    e.preventDefault()
    if (search.length !== 0) {
      const result = user.user.friends.filter(
        user => user.username.toLowerCase().includes(search.toLowerCase())
      )
      setSearchedUsers(result.length === 0? [{username: 'not found'}]: result)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Friends</title>
      </Head>

      <div className={styles.ribbon}>
        <h2>Friends</h2>
        <Serach 
          search={search} 
          setSearch={setSearch} 
          setSearchedUsers={setSearchedUsers} 
          searchUser={searchUser}
          loading={false}
        />
      </div>

      <div className={styles.users} style={{display: searchedUsers.length > 0? 'grid': 'none'}}>
        <DisplayUsers users={searchedUsers} ButtonConfiguration={ButtonConfiguration} />
      </div>

      <div className={styles.users} style={{display: searchedUsers.length > 0? 'none': 'grid'}}>
        {user.loading? generateCards(3): ''}
        <DisplayUsers users={user.user.friends} ButtonConfiguration={ButtonConfiguration} />
      </div>
      <div style={{display: searchedUsers.length > 0? 'none': 'grid'}}>
        { user.user.friends?.length === 0? <p >You have no friends.</p>: '' }
      </div>
    </div>
  )
}

export default Friends