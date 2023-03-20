import { useState } from 'react'
import { useRouter } from 'next/router'
import { BsArrowLeft } from 'react-icons/bs'
import { PasswordInput } from '../Inputs'
import styles from '../../../styles/auth.module.css'

const ChangePassword = ({ email }) => {

  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')

  const [passwordVisible, setPasswordVisible] = useState(false)
  const [repeatPasswordVisible, setRepeatPasswordVisible] = useState(false)

  const [passwordEntered, setPasswordEntered] = useState(false)
  const [repeatPasswordEntered, setRepeatPasswordEntered] = useState(false)

  const [initialPasswordEntered, setInitialPasswordEntered] = useState(false)
  const [initialRepeatPasswordEntered, setInitialRepeatPasswordEntered] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    if (password.length !== 0 && repeatPassword.length !== 0) {
      if (password.length > 7 && !password.includes(' ')) {
        if (password === repeatPassword) {
          await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/auth/change-password`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: {
              'Content-Type': 'application/json'
            }
          })
          router.push('/login')
        } else {
          setError('Both passwords must be the same.')
        }
      } else {
        setError('Password must be at least 8 characters and can not include spaces.')
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
        <PasswordInput 
          name='New Password' 
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
          name='Repeat New Password' 
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
        <button type='submit' onClick={submit}>Submit</button>
        <p className={styles.error}>{error}</p>
      </form>
    </div>
  )
}

export default ChangePassword