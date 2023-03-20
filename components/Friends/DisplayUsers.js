import { useUser } from '../../contexts/UserContext'
import styles from '../../styles/friends.module.css'

const DisplayUsers = ({ users, ButtonConfiguration }) => {

  const user = useUser()
  
  return (
    <>
      {
        users?.map(person => (
          person.username !== 'not found'?
            <div key={person.id} className={styles.user}>
              <img src={person.profile.pictureUrl} /> 
              <div className={styles.bottom}>
                <p>{person.username}</p>
                <ButtonConfiguration person={person} user={user} />
              </div>
            </div>
          :
            <p key='1'>No users found.</p>
        ))
      }
    </>
  )
}

export default DisplayUsers