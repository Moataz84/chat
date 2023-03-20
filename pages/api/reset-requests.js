import { checkRequest, connectDB } from '../../middleware'
import Users from '../../Users'

const handler = async (req, res) => {
  await Users.findOneAndUpdate({_id: req.body.id}, {$set: {requested: req.body.requested}})
  res.send('done')
}

export default connectDB(checkRequest(handler))