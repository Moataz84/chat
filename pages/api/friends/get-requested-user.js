import { checkRequest, connectDB } from '../../../middleware'
import Users from '../../../Users'

const handler = async (req, res) => {
  try {
    const result = await Users.find({username: 
      { $regex: req.body.search, $ne: req.body.username, $options: 'i'}
    })

    const users = result.map(user => ({
      id: user._id,
      username: user.username,
      profile: user.profile
    }))
    res.send({users})
  } catch (err) {
    res.send({users: []})
  }
}

export default connectDB(checkRequest(handler))