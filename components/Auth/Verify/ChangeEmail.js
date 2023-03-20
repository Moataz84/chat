import { useState } from 'react'
import { BsArrowLeft } from 'react-icons/bs'
import { TextInput } from '../Inputs'
import styles from '../../../styles/auth.module.css'

const ChangeEmail = ({ user, setPage }) => {

  const [email, setEmail] = useState('')
  const [emailEntered, setEmailEntered] = useState(false)
  const [initialEmailEntered, setInitialEmailEntered] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    if (email.length !== 0) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/auth/change-email`, {
        method: 'POST',
        body: JSON.stringify({email, id: user.id }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      const msg = data.msg
      setError(msg)
    } else {
      setError('All fields are required.')
    }
    setLoading(false)
  }

  return (
    <div className={styles['form-container']}>
      <form className={styles['auth-form']}>
        {loading? <div className={styles.loader} />: <></>}
        <h2>Verify Account</h2>
        <div className={styles.back}>
        <BsArrowLeft size={24} onClick={() => setPage('verify')} />
          Verify Code
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
        <p className={styles.error} style={{color: error === 'Email updated.'? '#000': ''}}>{error}</p>
      </form>
    </div>
  )
}

export default ChangeEmail