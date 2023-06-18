import { useState } from 'react'
import Head from 'next/head'
import { useUser } from '../contexts/UserContext'
import VerifyCode from '../components/Auth/Verify/VerifyCode'
import ChangeEmail from '../components/Auth/Verify/ChangeEmail'

const Verify = () => {

  const user = useUser()
  const [page, setPage] = useState('verify')
  
  return (
    <>
      <Head>
        <title>Verify Account</title>
      </Head>
      {
        page === 'verify'?
          <VerifyCode user={user.user} setLoggedIn={user.setLoggedIn} setPage={setPage} />
        :
          <ChangeEmail user={user.user} setPage={setPage} />
      }
    </>
  )
}

export default Verify