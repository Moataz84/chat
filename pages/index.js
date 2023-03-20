import { useState, useEffect } from 'react'
import Head from 'next/head'
import { BsArrowLeft } from 'react-icons/bs'
import { useSize } from '../contexts/ScreeSizeContext'
import { useCurrentChat } from '../contexts/CurrentChatContext'
import SidePannel from '../components/Chat/SidePannel'
import MainPannel from '../components/Chat/MainPannel'
import CreateChat from '../components/Chat/CreateChat'
import styles from '../styles/chat.module.css'

const Home = () => {

  const currentChat = useCurrentChat()
  
  const size = useSize()
  
  const [page, setPage] = useState('chat')

  const [fullscreen, setFullscreen] = useState(false)

  const [show, setShow] = useState(false)

  const [showChatBox, setShowChatBox] = useState(false)

  const [showImage, setShowImage] = useState(false)

  const [showMember, setShowMember] = useState(false)

  useEffect(() => {
    if (window.innerWidth > 760 && window.innerHeight > 640) setFullscreen(false)
    else {
      if (currentChat.currentChat?.roomId === undefined) setFullscreen(false)
      else setFullscreen(true)
    }
  }, [size])

  const back = () => {
    currentChat.setCurrentChat({})
    setFullscreen(false)
  }

  return (
    <>
      <div className={styles.unresponsive} style={{display: show? 'block' : 'none'}} />
      <div className={styles.unresponsive} style={{display: showChatBox? 'block' : 'none'}} />
      <div className={styles.unresponsive} style={{display: showImage? 'block' : 'none'}} />
      <div className={styles.unresponsive} style={{display: showMember? 'block' : 'none'}} />

      <div className={styles.container}>
        <Head>
          <title>Home</title>
        </Head>
        { 
          (size.width > 760) && (size.height > 640)? 
            <h2>Chats</h2> 
          : currentChat.currentChat?.roomId === undefined? 
            <h2>Chats</h2> 
          : ''
        }
        { 
          /*(size.width <= 760) && 
          (currentChat.currentChat?.roomId !== undefined)?
            <div className={styles.back} onClick={back}>
              <BsArrowLeft size={24} /> 
              Chats
            </div>
          : 
            <></> 
        */}
        {
          currentChat.currentChat?.roomId !== undefined?
            (size.width <= 760) || (size.height <= 640)?
              <div className={styles.back} onClick={back}>
                <BsArrowLeft size={24} /> 
                Chats
              </div>
            :
            <></>
          :
            <></>
        }
        <div className={styles['chat-container']}>
          { !fullscreen? <SidePannel setShow={setShow} setPage={setPage} setFullscreen={setFullscreen} /> : <></> }
          <MainPannel 
            page={page}
            setPage={setPage}
            showChatBox={showChatBox}
            setShowChatBox={setShowChatBox}
            showImage={showImage}
            setShowImage={setShowImage}
            showMember={showMember}
            setShowMember={setShowMember}
            setFullscreen={setFullscreen}
          />
          { show? <CreateChat setShow={setShow} setFullscreen={setFullscreen}v/> : <></> }
        </div>
      </div>
    </>
  )
}

export default Home
