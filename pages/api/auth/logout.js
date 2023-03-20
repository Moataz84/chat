import { checkRequest, connectDB } from '../../../middleware'

const handler = async (req, res) => {
  res.setHeader('Set-Cookie', 'JWT-Token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT')
  res.send('done')
}

export default connectDB(checkRequest(handler))