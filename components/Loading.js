import Head from 'next/head'
import styles from '../styles/main.module.css'

const Loading = ({ pathname }) => {
  return (
    <div className={styles['loading-container']}>
      <Head>
        <title>
          {
            pathname === '/'? 'Home'
            :pathname === '/settings'? 'Settings'
            :''
          }
        </title>
      </Head>
      <div className={styles.loader} />
    </div>
  )
}

export default Loading