import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { Bindings, Variables } from './types'
import publicRoutes from './routes/public'
import auth from './routes/auth'
import payment from './routes/payment'

import student from './routes/student'
import admin from './routes/admin'

import { ErrorView } from './views/error'
import { authMiddleware } from './middleware/auth'
import assets from './routes/assets'

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

app.use('*', logger())

// Auth middleware to inject user info into context
app.use('*', authMiddleware)

app.route('/', publicRoutes)
app.route('/auth', auth)
app.route('/payment', payment)
app.route('/my', student)
app.route('/admin', admin)
app.route('/assets', assets)

app.get('/health', (c) => c.text('OK'))

// Global Error Handler
app.onError((err, c) => {
  console.error(`${err}`)
  const user = c.get('user')
  return c.html(ErrorView({ 
    message: err.message || 'Internal Server Error', 
    status: 500,
    user 
  }), 500)
})

app.notFound((c) => {
  const user = c.get('user')
  return c.html(ErrorView({ 
    message: 'Page Not Found', 
    status: 404,
    user 
  }), 404)
})

export default app
