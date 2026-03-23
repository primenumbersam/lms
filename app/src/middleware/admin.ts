import { MiddlewareHandler } from 'hono'
import { Bindings, Variables } from '../types'

// 관리자 전용 라우트를 보호하는 미들웨어
export const adminMiddleware: MiddlewareHandler<{ Bindings: Bindings, Variables: Variables }> = async (c, next) => {
  const user = c.get('user')
  if (!user || user.role !== 'admin') {
    return c.text('Forbidden: Admin access required', 403)
  }
  await next()
}
