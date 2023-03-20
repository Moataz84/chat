import { BsSearch } from 'react-icons/bs'
import { CgClose } from 'react-icons/cg'
import styles from '../../styles/friends.module.css'

const Search = ({ search, setSearch, setSearchedUsers, searchUser, loading }) => {
  return (
    <>
      <div className={styles.search}>
        <BsSearch size={20} />
        <input type='text' value={search} placeholder='Search'
          onChange={e => {
            setSearch(e.target.value)
            if (e.target.value.length === 0) setSearchedUsers([])
          }}
          onKeyDown={e => {
            if (e.code === 'Enter') searchUser(e)
          }}
        />
        <CgClose size={22} style={{cursor: 'pointer'}} onClick={() => {
          setSearch('')
          setSearchedUsers([])
        }} />
      </div>
      <button onClick={searchUser}>Search</button>
      { loading? <div className={styles.loading} />: ''}
    </>
  )
}

export default Search