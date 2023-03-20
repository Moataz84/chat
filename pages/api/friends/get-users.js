import { checkRequest, connectDB } from '../../../middleware'
import Users from '../../../Users'

const handler = async (req, res) => {
  const result = await Users.find({_id: {$ne: req.body.id}, index: {$gte: req.body.index}, disabled: false}).limit(20)
  const users = result.map(user => ({
    id: user._id,
    index: user.index,
    username: user.username,
    profile: user.profile
  }))
  res.send({users})
}

export default connectDB(checkRequest(handler))