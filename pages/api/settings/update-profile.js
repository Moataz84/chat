import ImageKit from 'imagekit'
import { checkRequest, connectDB } from '../../../middleware'
import Users from '../../../Users'

const handler = async (req, res) => {
  const base64 = req.body.dataUrl.split(',')[1]
  const fileName = `${req.body.id}-profile.${req.body.extension}`

  const imagekit = new ImageKit({
    publicKey : process.env.PUBLIC_KEY,
    privateKey : process.env.PRIVATE_KEY,
    urlEndpoint : 'https://ik.imagekit.io/pk4i4h8ea/'
  })

  const result = await Users.findOne({_id: req.body.id})

  if (result.profile.pictureUrl.includes(req.body.id)) {
    imagekit.deleteFile(result.profile.pictureId, () => {})
  }

  imagekit.upload({
    file: base64,
    fileName,
    folder: 'chat-website/profile-pictures'
  }, async (e, result) => {
    const profile = {
      pictureUrl: result.url,
      pictureId: result.fileId
    }
    await Users.findOneAndUpdate({_id: req.body.id}, {$set: {profile}})
  })
  res.send('done')
}

export default connectDB(checkRequest(handler))