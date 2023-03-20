import { FaEye, FaEyeSlash } from 'react-icons/fa'

const addStyle = (setEntered, setError)  => {
  setEntered(true)
  setError('')
}

const hideStyle = (setEntered, setInitialEntered) => {
  setEntered(false)
  setInitialEntered(true)
}

const TextInput = ({
  name, 
  value, 
  type,
  setValue,
  styles,
  entered, 
  setEntered,
  initialEntered, 
  setInitialEntered,
  setError
}) => {
  return (
    <div className={`${entered? styles['entered']: ''} ${initialEntered && value.length === 0? styles['box-error']: ''}`}>
      <input type={type}
        placeholder={!entered? name: ''}
        value={value}
        name={name}
        onChange={e => setValue(e.target.value)}
        onFocus={() => addStyle(setEntered, setError)}
        onBlur={() => hideStyle(setEntered, setInitialEntered)}
      />
      <p className={`${entered?styles['initial-enter']: ''} ${(initialEntered && value.length === 0)? styles['text-error']: ''}`}>{name}</p>
    </div>
  )
}

TextInput.defaultProps = {
  type: 'text'
}

const PasswordInput = ({
  name, 
  value, 
  setValue,
  styles,
  entered, 
  setEntered,
  initialEntered, 
  setInitialEntered,
  visible,
  setVisible,
  setError
}) => {
  return (
    <div className={`${entered? styles['entered']: ''} ${initialEntered && value.length === 0? styles['box-error']: ''}`}>    
      <input 
        type={visible? 'text': 'password'}
        placeholder={!entered? name: ''}
        value={value}
        name='password'
        onChange={e => setValue(e.target.value)}
        onFocus={() => addStyle(setEntered, setError)}
        onBlur={() => hideStyle(setEntered, setInitialEntered)}
      />
      <p className={`${entered?styles['initial-enter']: ''} ${(initialEntered && value.length === 0)? styles['text-error']: ''}`}>{name}</p>
      {
        visible?
          <FaEyeSlash size={28} onClick={() => setVisible(previous => !previous)} />
        :
          <FaEye size={26} onClick={() => setVisible(previous => !previous)} />
      }
    </div>
  )
}

export {TextInput, PasswordInput}
