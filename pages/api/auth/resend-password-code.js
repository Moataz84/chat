import { v4 } from 'uuid'
import Users from '../../../Users'
import { checkRequest, connectDB, sendEmail } from '../../../middleware'

const handler = async (req, res) => {
  const forgotPasswordCode = v4().toString().replace(/-/g, '')
  await Users.findOneAndUpdate({email: req.body.email.toLowerCase()}, {$set: { forgotPasswordCode}})
  sendEmail(req.body.email, 'Verification Code', `Your verification code is ${forgotPasswordCode}.`)
  res.send('done')
}

export default connectDB(checkRequest(handler))