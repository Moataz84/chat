import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { serialize } from 'cookie'
import Users from '../../../Users'
import { checkRequest, connectDB } from '../../../middleware'

const handler = async (req, res) => {
  const user = await Users.findOne({email: req.body.email, disabled: false})
  if (user !== null) {
    const result = await compare(req.body.password, user.password)
    if (result) {
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
      res.send({msg: 'The password you entred is incorrect.'})
    }
  } else {
    res.send({msg: 'This account does not exist'})
  }
}

export default connectDB(checkRequest(handler))