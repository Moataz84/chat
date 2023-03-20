import Users from '../../../Users'
import { checkRequest, connectDB, sendEmail } from '../../../middleware'

const handler = async (req, res) => {
  const user = await Users.findOne({email: req.body.email.toLowerCase()})
  if (user !== null) {
    sendEmail(user.email, 'Forgot Password', `Your one time code is ${user.forgotPasswordCode}.`)
    res.send({msg: 'success'})
  } else {
    res.send({msg: 'This account does not exist.'})
  }
}

export default connectDB(checkRequest(handler))