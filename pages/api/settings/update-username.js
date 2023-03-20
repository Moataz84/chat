import { checkRequest, connectDB } from '../../../middleware'
import Users from '../../../Users'

const handler = async (req, res) => {
  const result = await Users.findOne({username: req.body.username})
  if (result === null) {
    await Users.findOneAndUpdate({_id: req.body.id}, {$set: {username: req.body.username}})
    res.send({msg: 'Username updated.'})
  } else {
    res.send({msg: 'This username already exists.'})
  }
}

export default connectDB(checkRequest(handler))