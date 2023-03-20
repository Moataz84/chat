import { checkRequest, connectDB } from '../../../middleware'
import { compare, hash } from 'bcrypt'
import Users from '../../../Users'

const handler = async (req, res) => {
  const user = await Users.findOne({_id: req.body.id})
  const result = await compare(req.body.password, user.password)
  if (result) {
    const password = await hash(req.body.newPassword, 10)
    await Users.findOneAndUpdate({_id: req.body.id}, {$set: {password}})
    res.send({msg: 'Password updated.'})
  } else {
    res.send({msg: 'Inccorect current password.'})
  }
}

export default connectDB(checkRequest(handler))