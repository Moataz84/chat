import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { TextInput, PasswordInput } from '../components/Auth/Inputs'
import { useUser } from '../contexts/UserContext'
import styles from '../styles/auth.module.css'

const SignUp = () => {

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')

  const [passwordVisible, setPasswordVisible] = useState(false)
  const [repeatPasswordVisible, setRepeatPasswordVisible] = useState(false)

  const [usernameEntered, setUsernameEntered] = useState(false)
  const [emailEntered, setEmailEntered] = useState(false)
  const [passwordEntered, setPasswordEntered] = useState(false)
  const [repeatPasswordEntered, setRepeatPasswordEntered] = useState(false)

  const [initialUsernameEntered, setInitialUsernameEntered] = useState(false)
  const [initialEmailEntered, setInitialEmailEntered] = useState(false)
  const [initialPasswordEntered, setInitialPasswordEntered] = useState(false)
  const [initialRepeatPasswordEntered, setInitialRepeatPasswordEntered] = useState(false)

  const [error, setError] = useState('')
  const condition = 
    username.length === 0 || 
    email.length === 0 || 
    password.length === 0 || 
    repeatPassword.length === 0

  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const user = useUser()

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    
    if (!condition) {
      if (username.length > 3 && !username.includes(' ')) {
        if (password.length > 7 && !password.includes(' ')) {
          if (password === repeatPassword) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/auth/sign-up`, {
              method: 'POST',
              body: JSON.stringify({username, email: email.replace(/ /g,'').toLowerCase(), password}),
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
            setError('Both passwords must be the same.')
          }
        } else {
          setError('Password must be at least 8 characters and can not include spaces.')
        }
      } else {
        setError('Username must contain atleast 4 characters and can not include spaces.')
      }
    } else {
      setError('All fields are required.')
    }
    setLoading(false)
  }

  return (
    <div className={styles['form-container']}>
      <Head>
        <title>Sign Up</title>
      </Head>
      <form className={styles['auth-form']}>
        {loading? <div className={styles.loader} />: <></>}
        <h2>Sign Up</h2>
        <TextInput 
          name='Username' 
          value={username}
          setValue={setUsername}
          styles={styles}
          entered={usernameEntered}
          setEntered={setUsernameEntered}
          initialEntered={initialUsernameEntered}
          setInitialEntered={setInitialUsernameEntered}
          setError={setError}
        />
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
        <PasswordInput 
          name='Repeat Password' 
          value={repeatPassword}
          setValue={setRepeatPassword}
          styles={styles}
          entered={repeatPasswordEntered}
          setEntered={setRepeatPasswordEntered}
          initialEntered={initialRepeatPasswordEntered}
          setInitialEntered={setInitialRepeatPasswordEntered}
          visible={repeatPasswordVisible}
          setVisible={setRepeatPasswordVisible}
          setError={setError}
        />
        <button type='submit' onClick={submit}>Sign Up</button>
        <div className={styles.text}>
          Already have an account? 
          <Link href='/login'>
            <a> Login</a>
          </Link>
        </div>
        <p className={styles.error}>{error}</p>
      </form>
    </div>
  )
}

export default SignUp