import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { MiddlewareHandler } from 'hono'
import { Bindings, Variables } from '../types'

// 글로벌 로그인을 위한 토큰 검증 미들웨어
export const authMiddleware: MiddlewareHandler<{ Bindings: Bindings, Variables: Variables }> = async (c, next) => {
  const token = getCookie(c, 'token')
  if (token) {
    try {
      const payload = await verify(token, c.env.JWT_SECRET, 'HS256') as any
      c.set('user', {
        id: payload.id,
        email: payload.email,
        role: payload.role || 'student'
      })
    } catch (e) {
      // Invalid token
    }
  }
  await next()
}

// 어드민 권한 체크 미들웨어
export const adminMiddleware: MiddlewareHandler<{ Bindings: Bindings, Variables: Variables }> = async (c, next) => {
  const user = c.get('user')
  if (!user || user.role !== 'admin') {
    return c.text('Unauthorized: Admin access required', 401)
  }
  await next()
}
