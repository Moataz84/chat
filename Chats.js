import { mongoose } from 'mongoose'

const schema = new mongoose.Schema({
  roomId: String,
  members: Array,
  name: String,
  profile: Object,
  messages: Array,
  notActive: Array,
  disabled: Boolean
})

const Chats = mongoose.models.chats || mongoose.model('chats', schema)
export default Chats