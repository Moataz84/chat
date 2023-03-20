import { verify } from 'jsonwebtoken'

const handler = async (req, res) => {
  const token = req.body.token
  try {
    const result = verify(token, process.env.ACCESS_TOKEN_SECRET)
    res.send({status: 'success', verified: result.user.verified})
  } catch {
    res.send({status: 'error', verified: false})
  }
}

export default handler