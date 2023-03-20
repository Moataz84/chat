import { useState } from 'react'
import { useRouter } from 'next/router'
import { BsArrowLeft } from 'react-icons/bs'
import { TextInput } from '../Inputs'
import styles from '../../../styles/auth.module.css'

const VerifyEmail = ({ setPage, setEmailState }) => {

  const [email, setEmail] = useState('')
  const [emailEntered, setEmailEntered] = useState(false)
  const [initialEmailEntered, setInitialEmailEntered] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    if (email.length !== 0) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/auth/verify-email`, {
        method: 'POST',
        body: JSON.stringify({email }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      const msg = data.msg
      if (msg !== 'success') setError(msg)
      if (msg === 'success') {
        setEmailState(email)
        setPage('code')
      }
    } else {
      setError('All fields are required.')
    }
    setLoading(false)
  }

  return (
    <div className={styles['form-container']}>
      <form className={styles['auth-form']}>
        {loading? <div className={styles.loader} />: <></>}
        <h2>Forgot Password</h2>
        <div className={styles.back}>
        <BsArrowLeft size={24} onClick={() => router.push('/login')} />
          Login
        </div>
        <TextInput 
          name='Email' 
          value={email}
          setValue={setEmail}
          styles={styles}
          entered={emailEntered}
          setEntered={setEmailEntered}
          initialEntered={initialEmailEntered}
          setInitialEntered={setInitialEmailEntered}
          setError={setError}        
        />
        <button type='submit' onClick={submit}>Submit</button>
        <p className={styles.error}>{error}</p>
      </form>
    </div>
  )
}

export default VerifyEmail