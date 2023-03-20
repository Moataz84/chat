import Users from '../../../Users'
import { checkRequest, connectDB, sendEmail } from '../../../middleware'

const handler = async (req, res) => {
  const result = await Users.findOne({_id: req.body.id})
  sendEmail(result.email, 'Verification Code', `Your verification code is ${result.code}.`)
  res.send('done')
}

export default connectDB(checkRequest(handler))