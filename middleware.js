import mongoose from 'mongoose'
import { createTransport } from 'nodemailer'

const checkRequest = handler => async (req, res) => {
  try {
    if (req.url.includes('api')) {
      if (req.method === 'POST') {
        if (req.headers.origin === process.env.NEXT_PUBLIC_SERVER) return handler(req, res)
        else res.status(403).send('Forbidden request')
      } else {
        res.status(403).send('Only POST requests are allowed.')
      }
    }
  } catch (err) {
    res.send('An error occurred')
  }
}

const connectDB = handler => async (req, res) => {
  if (mongoose.connections[0].readyState) return handler(req, res)
  await mongoose.connect(process.env.CHAT_DB_URI)
  return handler(req, res)
}

const sendEmail = (recipent, subject, body) => {
  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: 'moatazghazy442005@gmail.com',
      pass: process.env.PASSWORD
    }
  })
  const mailOptions = {
    from: 'Chat',
    to: recipent,
    subject,
    text: body
  }
  transporter.sendMail(mailOptions, err => {
    if (err) console.log(err)
  })
}

export { checkRequest, connectDB, sendEmail }