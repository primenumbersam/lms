import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import { Database } from '../lib/d1'

import { Bindings, Variables } from '../types'

const auth = new Hono<{ Bindings: Bindings, Variables: Variables }>()

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

auth.get('/google', (c) => {
  const next = c.req.query('next') || '/'
  const redirectUri = `${new URL(c.req.url).origin}/auth/google/callback`
  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state: next // Use state to pass the redirect URL
  })
  return c.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`)
})

auth.get('/google/callback', async (c) => {
  const code = c.req.query('code')
  const next = c.req.query('state') || '/'
  if (!code) return c.text('Authorization code missing', 400)

  const redirectUri = `${new URL(c.req.url).origin}/auth/google/callback`

  // 1. Exchange code for token
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const { access_token } = await tokenRes.json<{ access_token: string }>()

  // 2. Get user info
  const userRes = await fetch(GOOGLE_USER_INFO_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  const profile = await userRes.json<{ sub: string; email: string; name: string; picture: string }>()

  const db = new Database(c.env.DB)
  let user = await db.getUserByEmail(profile.email)

  const isAdminEmail = profile.email === 'primenumbersam@gmail.com'

  if (!user) {
    user = {
      id: crypto.randomUUID(),
      email: profile.email,
      name: profile.name,
      avatar_url: profile.picture,
      role: isAdminEmail ? 'admin' : 'student',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    await db.createUser(user)
  } else if (isAdminEmail && user.role !== 'admin') {
    // Ensure the designated admin email always has admin role even if record exists
    await db.db.prepare('UPDATE users SET role = ? WHERE email = ?')
      .bind('admin', profile.email)
      .run()
    user.role = 'admin'
  }

  // 3. Generate JWT
  const token = await sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    },
    c.env.JWT_SECRET
  )

  setCookie(c, 'token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return c.redirect(next)
})

auth.get('/logout', (c) => {
  deleteCookie(c, 'token')
  return c.redirect('/')
})

auth.get('/me', async (c) => {
  const token = getCookie(c, 'token')
  if (!token) return c.json({ user: null })

  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256') as any
    return c.json({ user: payload })
  } catch {
    return c.json({ user: null })
  }
})

export default auth
