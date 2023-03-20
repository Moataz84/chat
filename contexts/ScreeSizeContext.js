import React, { useState, useEffect, useContext } from 'react'

const screenSizeContext = React.createContext()
export const useSize = () => useContext(screenSizeContext)

const ScreenSizeContext = ({ children }) => {
  const [size, setSize] = useState({})
  useEffect(() => {
    setSize({width: window.innerWidth, height: window.innerHeight})
    window.addEventListener('resize', () =>     setSize({width: window.innerWidth, height: window.innerHeight}))
  }, [])
  
  return (
    <screenSizeContext.Provider value={size}>
      {children}
    </screenSizeContext.Provider>
  )
}

export default ScreenSizeContext