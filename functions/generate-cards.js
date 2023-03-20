import styles from '../styles/friends.module.css'

const generateCards = number => {
  const cards = []
  for (let i = 0; i < 20; i++) {
    cards.push(
      <div key={i} className={styles.card}>
        <div className={styles['mock-profile']} />
        <div className={styles.bottom}>
          {[...Array(number)].map((v, i) => <div key={i} className={styles['name-placeholder']} />)}
        </div>
      </div>
    )
  }
  return cards
}

export default generateCards