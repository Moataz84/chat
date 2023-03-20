import React, { useState, useContext } from 'react'

const usersContext = React.createContext()
export const useUsers = () => useContext(usersContext)

const UsersContext = ({ children }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [userId, setId] = useState('')

  const getUsers = async id => {     
    if (!done) {
      if (id !== undefined) setId(id)
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/friends/get-users`, {
        method: 'POST',
        body: JSON.stringify({id: id === undefined ? userId : id, index}),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      setUsers([...users, ...data?.users])
      setLoading(false)
      if (data.users.length < 20) {
        setDone(true)
        return
      }
      setIndex(data.users[data.users.length - 1]?.index + 1)
    }
  }
  
  const resetState = () => {
    setIndex(0)
    setLoading(true)
    setDone(false)
    setUsers([])
    setId('')
  }
  
  return (
    <usersContext.Provider value={{users, getUsers, setUsers, loading, resetState}}>
      {children}
    </usersContext.Provider>
  )
}

export default UsersContext