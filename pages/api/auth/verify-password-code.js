import Users from '../../../Users'
import { checkRequest, connectDB } from '../../../middleware'

const handler = async (req, res) => {
  const user = await Users.findOne({email: req.body.email.toLowerCase()})
  if (user.forgotPasswordCode === req.body.code) {
    res.send({msg: 'success'})
  } else {
    res.send({msg: 'The code you entered is incorrect.'})
  }
}

export default connectDB(checkRequest(handler))