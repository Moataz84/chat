import io from 'socket.io-client'

let socket
const connectSocket = async () => {
  await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/socket`, {
    method: 'POST'
  })
  socket = io()
  socket.on('connect', () => console.log('Connected'))
}

export { connectSocket, socket }