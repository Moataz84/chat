import { mongoose } from 'mongoose'

const schema = new mongoose.Schema({
  index: Number,
  username: String,
  email: String,
  password: String,
  code: String,
  verified: Boolean,
  forgotPasswordCode: String,
  profile: Object,
  friends: Array,
  requests: Array,
  requested: Array,
  chats: Array,
  disabled: Boolean
})

const Users = mongoose.models.users || mongoose.model('users', schema)
export default Users