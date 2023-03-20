import { CgClose } from 'react-icons/cg'
import styles from '../../../../styles/chat.module.css'

const ImageViewer = ({ setShowImage, image}) => {
  return (
    <div className={styles['image-viewer']} onClick={() => setShowImage(false)}>
      <CgClose 
        id={styles.close} 
        className={styles.icons} 
        size={25} 
        onClick={() => setShowImage(false)} 
      />
      <img src={image} />
    </div>
  )
}

export default ImageViewer