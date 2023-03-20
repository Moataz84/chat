import Head from 'next/head'
import styles from '../styles/main.module.css'

export default function NotFound() {
  return (
    <div className={styles['not-found']}>
      <Head>
        <title>Not found</title>
      </Head>
      <h2>404 Error</h2>
      <p>This page is not found. It porbably doesn't exist.</p>
    </div>
  )
}
