import { hash } from 'bcrypt'
import Users from '../../../Users'
import { checkRequest, connectDB } from '../../../middleware'

const handler = async (req, res) => {
  const password = await hash(req.body.password, 10)
  await Users.findOneAndUpdate({email: req.body.email.toLowerCase()}, {$set: {password}})
  res.send('done')
}

export default connectDB(checkRequest(handler))