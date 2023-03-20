import { NextResponse } from 'next/server'
import { routes } from '../variables'

const middleware = async req => {
  const cookies = req.cookies
  const token = cookies['JWT-Token']
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/auth`, {
    method: 'POST',
    body: JSON.stringify({token}),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const { status, verified } = await res.json()
  const pathname = new URL(req.url).pathname

  if (status === 'error') {
    if (![...routes, '/verify'].includes(pathname)) return NextResponse.next()
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SERVER}/login`)
  } else {
    if (!verified) {
      if ([...routes, '/sign-up', '/login'].includes(pathname))
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SERVER}/verify`)
    } else {
      if (['/sign-up', '/login', '/verify'].includes(pathname))
        return NextResponse.redirect(process.env.NEXT_PUBLIC_SERVER)
      return NextResponse.next()
    }
  }
}

export default middleware