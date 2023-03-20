import { hash } from 'bcrypt'
import { v4 } from 'uuid'
import { serialize } from 'cookie'
import { sign } from 'jsonwebtoken'
import Users from '../../../Users'
import { checkRequest, connectDB, sendEmail } from '../../../middleware'

const handler = async (req, res) => {
  const emailCheck = await Users.findOne({email: req.body.email, disabled: false})
  if (emailCheck === null) {
    const usernameCheck = await Users.findOne({username: req.body.username, disabled: false})
    if (usernameCheck === null) {
      const result = await Users.findOne({}, {}, {sort: {index: -1}})
      const index = result === null ? 0 : result.index + 1
      const username = req.body.username
      const email = req.body.email.toLowerCase()
      const password = await hash(req.body.password, 10)
      const code = v4().replace(/\D/g,'').substring(0, 6)
      const verified = false
      const forgotPasswordCode = v4().toString().replace(/-/g, '')
      const profile = {
        pictureUrl: 'https://ik.imagekit.io/pk4i4h8ea/chat-website/profile-pictures/no-profile_Jfensf-p1.jpg',
        pictureId: '62d9851bda2224c770a4793e'
      }
      const requests = []
      const requested = []
      const friends = []
      const user = await new Users({
        index, 
        username, 
        email, 
        password, 
        code, 
        verified, 
        forgotPasswordCode, 
        profile, 
        requests, 
        requested, 
        friends,
        disabled: false
      }).save()
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
      sendEmail(email, 'Verification Code', `Your verification code in ${code}.`)
      res.send({msg: 'success'})
    } else {
      res.send({msg: 'This username already exists.'})
    }
  } else {
    res.send({msg: 'This email address is already in use.'})
  }
}

export default connectDB(checkRequest(handler))
