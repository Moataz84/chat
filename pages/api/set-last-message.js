import { checkRequest, connectDB } from '../../middleware'
import Users from '../../Users'

const handler = async (req, res) => {
  await Users.findOneAndUpdate(
    {_id: req.body.id}, 
    {$set: {'chats.$[el].seen': req.body.seen}}, 
    {arrayFilters: [{ 'el.roomId': req.body.roomId }]}
  )
  res.send('done')
}

export default connectDB(checkRequest(handler))