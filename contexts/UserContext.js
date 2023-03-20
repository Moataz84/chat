import React, { useState, useContext } from 'react'

const userContext = React.createContext()
export const useUser = () => useContext(userContext)

const UserContext = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState({})
  const [chats, setChats] = useState([])
  const [requestNotifications, setRequestNotifications] = useState(0)

  const getUser = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/auth/get-user`, {
      method: 'POST'
    })
    const data = await res.json()
    const {status, user, chats} = data
    if (status === 'success') {
      setUser(user)
      setChats(chats)
      setRequestNotifications(user.requested.filter(request => request.seen === false).length)
      setLoggedIn(true)
      setLoading(false)
      return { signed: true, id: user.id, rooms: chats.map(chat => chat.roomId)}
    }
    else {
      setRequestNotifications(0)
      setUser({})
      setChats([])
      setLoggedIn(false)
      setLoading(true)
      return {signed: null}
    }
  }
  
  return (
    <userContext.Provider value={{
      user, 
      setUser, 
      getUser, 
      chats,
      setChats,
      loggedIn, 
      setLoggedIn, 
      loading, 
      setLoading,
      requestNotifications,
      setRequestNotifications
    }}>
      {children}
    </userContext.Provider>
  )
}

export default UserContext