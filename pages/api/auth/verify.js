import { sign } from 'jsonwebtoken'
import { serialize } from 'cookie'
import Users from '../../../Users'
import { checkRequest, connectDB } from '../../../middleware'

const handler = async (req, res) => {
  const result = await Users.findOne({_id: req.body.id})
  if (result.code === req.body.code) {
    const user = await Users.findOneAndUpdate({_id: req.body.id}, {$set: {verified: true}}, {new: true})
    const token = sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5, 
        user: {
          id: user._id, 
          verified: user.verified, 
        }
      }, 
      process.env.ACCESS_TOKEN_SECRET
    )
    const serialized = serialize('JWT-Token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 5,
      path: '/'
    })
    res.setHeader('Set-Cookie', serialized)
    res.send({msg: 'success'})
  } else {
    res.send({msg: 'The verification code you enterd is incorrect.'})
  }
}

export default connectDB(checkRequest(handler))