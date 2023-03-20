import React, { useState, useContext } from 'react'

const currentChatContext = React.createContext()
export const useCurrentChat = () => useContext(currentChatContext)

const CurrentChatContext = ({ children }) => {
  const [currentChat, setCurrentChat] = useState({})
  
  return (
    <currentChatContext.Provider value={{currentChat, setCurrentChat}}>
      {children}
    </currentChatContext.Provider>
  )
}

export default CurrentChatContext