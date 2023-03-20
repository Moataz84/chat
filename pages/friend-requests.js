import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useUser } from '../contexts/UserContext'
import FriendRequests from '../components/Friends/Friend-Requests/FriendRequests'
import FriendRequestsSent from '../components/Friends/Friend-Requests/FriendRequestsSent'
import styles from '../styles/friends.module.css'

const FriendRequestsPage = () => {

  const user = useUser()

  const [page, setPage] = useState('friend-requests')

  useEffect(() => {
    const resetNotifications = async () => {
      user.setRequestNotifications(0)
      await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/reset-requests`, {
        method: 'POST',
        body: JSON.stringify({
          id: user.user.id, 
          requested: user.user.requested?.map(request => ({id: request.id, seen: true}))
        }),
        headers: { 
          'Content-Type': 'application/json'
        }
      })
    }
    resetNotifications()
  }, [user.requestNotifications])

  return (
    <div className={styles.container}>
      <Head>
        <title>Friend Requests</title>
      </Head>
      {
        page === 'friend-requests'?
          <FriendRequests setPage={setPage} />
        :
          <FriendRequestsSent setPage={setPage} />
      }
    </div>
  )
}

export default FriendRequestsPage