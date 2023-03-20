import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { BsArrowLeft } from 'react-icons/bs'
import { TextInput } from '../Inputs'
import styles from '../../../styles/auth.module.css'

const VerifyCode = ({ user, setPage }) => {

  const router = useRouter()
  const [code, setCode] = useState('')
  const [codeEntered, setCodeEntered] = useState(false)
  const [initialCodeEntered, setInitialCodeEntered] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [time, setTime] = useState(60)

  useEffect(() => {
    if (sent) {
      const timeout = setTimeout(() => setTime(time - 1), 1000)
      if (time === 0) {
        clearTimeout(timeout)
        setSent(false)
        setTime(60)
      }
    }
  }, [time, sent])

  const resend = async e => {
    e.preventDefault()
    setSent(true)
    await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/auth/resend`, {
      method: 'POST',
      body: JSON.stringify({id: user.id }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    if (code.length !== 0) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/auth/verify`, {
        method: 'POST',
        body: JSON.stringify({code, id: user.id }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      const msg = data.msg
      if (msg !== 'success') setError(msg)
      if (msg === 'success') {
        setSent(false)
        router.push('/')
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
        <h2>Verify Account</h2>
        <div className={styles.back}>
          <BsArrowLeft size={24} onClick={() => setPage('change-email')} />
          Change Email
        </div>
        <TextInput 
          name='Verification Code' 
          type='number'
          value={code}
          setValue={setCode}
          styles={styles}
          entered={codeEntered}
          setEntered={setCodeEntered}
          initialEntered={initialCodeEntered}
          setInitialEntered={setInitialCodeEntered}
          setError={setError}        
        />
        {
          sent? <div className={styles.text}>Resend Code in {time}s</div>:
          <div className={styles.text} style={{cursor: 'pointer'}} onClick={resend}>Resend Code</div>
        }
        <button type='submit' onClick={submit}>Submit</button>
        <p className={styles.error}>{error}</p>
      </form>
    </div>
  )
}

export default VerifyCode