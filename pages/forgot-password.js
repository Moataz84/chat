import { useState } from 'react'
import Head from 'next/head'
import VerifyEmail from '../components/Auth/Forgot-Password/VerifyEmail'
import VerifyCode from '../components/Auth/Forgot-Password/VerifyCode'
import ChangePassword from '../components/Auth/Forgot-Password/ChangePassword'

const ForgotPassword = () => {

  const [page, setPage] = useState('email')
  const [email, setEmailState] = useState()

  return (
    <>
      <Head>
        <title>Forgot Password</title>
      </Head>
      {
        page === 'email'?
          <VerifyEmail setPage={setPage} setEmailState={setEmailState} />
        : page === 'code'? 
          <VerifyCode setPage={setPage} email={email} />
        :
          <ChangePassword email={email} />
      }
    </>
  )
}

export default ForgotPassword