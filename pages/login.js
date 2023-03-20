import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { TextInput, PasswordInput } from '../components/Auth/Inputs'
import { useRouter } from 'next/router'
import { useUser} from '../contexts/UserContext'
import styles from '../styles/auth.module.css'

const Login = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [passwordVisible, setPasswordVisible] = useState(false)

  const [emailEntered, setEmailEntered] = useState(false)
  const [passwordEntered, setPasswordEntered] = useState(false)

  const [initialEmailEntered, setInitialEmailEntered] = useState(false)
  const [initialPasswordEntered, setInitialPasswordEntered] = useState(false)

  const [error, setError] = useState('')
  const condition = email.length === 0 || password.length === 0

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const user = useUser()

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    if (!condition) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({email, password}),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      const msg = data.msg
      if (msg !== 'success') setError(msg)
      if (msg === 'success') {
        user.setLoggedIn(true)
        router.push('/')
      }
    } else {
      setError('All fields are required.')
    }
    setLoading(false)
  }

  return (
    <div className={styles['form-container']}>
      <Head>
        <title>Sign In</title>
      </Head>
      <form className={styles['auth-form']}>
        {loading? <div className={styles.loader} />: <></>}
        <h2>Sign In</h2>
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
        <PasswordInput 
          name='Password' 
          value={password}
          setValue={setPassword}
          styles={styles}
          entered={passwordEntered}
          setEntered={setPasswordEntered}
          initialEntered={initialPasswordEntered}
          setInitialEntered={setInitialPasswordEntered}
          visible={passwordVisible}
          setVisible={setPasswordVisible}
          setError={setError}
        />
        <Link href='/forgot-password'>
          <a className={styles['forgot-password']}>Forgot Password</a>
        </Link>
        <button type='submit' onClick={submit}>Sign In</button>
        <div className={styles.text}>
          Don't have an account? 
          <Link href='/sign-up'>
            <a> Sign Up</a>
          </Link>
        </div>
        <p className={styles.error}>{error}</p>
      </form>
    </div>
  )
}

export default Login