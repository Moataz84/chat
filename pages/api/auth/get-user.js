import { verify } from 'jsonwebtoken'
import { checkRequest, connectDB } from '../../../middleware'
import Users from '../../../Users'
import Chats from '../../../Chats'

const handler = async (req, res) => {
  const token = req.cookies['JWT-Token']
  try {
    const id = verify(token, process.env.ACCESS_TOKEN_SECRET).user.id
    const result = await Users.findOne({_id: id})
    const chatsArray = await Chats.find({roomId: result.chats.map(chat => chat.roomId)})
    const requests = await Users.find({_id: result.requests})
    const requested = await Users.find({_id: result.requested.map(request => request.id)})
    const friends = await Users.find({_id: result.friends})

    const chats = await Promise.all(chatsArray.map(async chat => {
      const chatMembers = await Users.find({_id: chat.members.filter(member => member !== id)})
      const members = [
        {
          id: result._id,
          username: result.username,
          profile: result.profile,
        },
        ...chatMembers.map(member => ({
          id: member._id, 
          username: member.username, 
          profile: member.profile
        }))
      ]
      const chatRefernce = result.chats.find(c => c.roomId === chat.roomId)

      let extendedChat
      if (chatRefernce.extends !== undefined) {
        const previousChats = await Chats.find({roomId: chatRefernce.extends})
        extendedChat = previousChats.map(chat => chat.messages).reduce((i, j) => [...i, ...j], [])    
      }
      
      const index = chatRefernce.index
      const seen = chatRefernce.seen
      const name = chat.name === ''? members[1].username: chat.name
      const profile = chat.profile.pictureUrl === ''? members[1].profile: chat.profile
      const roomId = chat.roomId
      const messages = extendedChat !== undefined? [...extendedChat, ...chat.messages]: chat.messages
      const disabled = chat.disabled
      const notActive = chat.notActive
      return {
        index, seen, name, roomId, profile, members, messages, disabled, notActive
      }
    }))
    
    const user = {
      id: result._id,
      username: result.username,
      profile: result.profile,
      friends: friends.map(person => 
        ({id: person._id, username: person.username, profile: person.profile})
      ),
      requests: requests.map(person => 
        ({id: person._id, username: person.username, profile: person.profile})
      ),
      requested: requested.map(person => 
        ({
          id: person._id, 
          username: person.username, 
          profile: person.profile, 
          seen: result.requested.find(request => request.id === person.id).seen
        }))
    }
    res.send({status: 'success', user, chats})
  } catch {
    res.send({status: 'error', user: {}})
  }
}

export default connectDB(checkRequest(handler))