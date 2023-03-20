import Users from '../../../Users'
import { checkRequest, connectDB, sendEmail } from '../../../middleware'

const handler = async (req, res) => {
  const user = await Users.findOneAndUpdate({_id: req.body.id}, {$set: {email: req.body.email.toLowerCase()}}, {new: true})
  sendEmail(user.email, 'Verification Code', `Your verification code is ${user.code}.`)
  res.send({msg: 'Email updated.'})
}

export default connectDB(checkRequest(handler))