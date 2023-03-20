import Head from 'next/head'
import UserContext from '../contexts/UserContext'
import UsersContext from '../contexts/UsersContext'
import CurrentChatContext from '../contexts/CurrentChatContext'
import ScreenSizeContext from '../contexts/ScreeSizeContext'
import Layout from '../components/Layout'
import '../styles/global.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel='shortcut icon' href='favicon.png' />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0" />
      </Head>
      <UserContext>
        <CurrentChatContext>
          <UsersContext>
            <ScreenSizeContext>
              <Layout>
                <Component {...pageProps} />
              </Layout> 
            </ScreenSizeContext>
          </UsersContext>
        </CurrentChatContext>
      </UserContext>
    </>
  )
}

export default MyApp
