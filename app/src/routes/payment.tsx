import { Hono } from 'hono'
import { Database } from '../lib/d1'
import { TossClient } from '../lib/toss'
import { Bindings, Variables } from '../types'
import { PaymentSuccess } from '../views/pages/PaymentSuccess'
import { PaymentFail } from '../views/pages/PaymentFail'

const payment = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// 결제 준비: orderId 발급 및 pending 결제 기록 생성
payment.get('/prepare', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const course_id = c.req.query('course_id')
  if (!course_id) return c.json({ error: 'Course ID missing' }, 400)

  const db = new Database(c.env.DB)
  const course = await db.db.prepare('SELECT * FROM courses WHERE id = ?').bind(course_id).first<any>()
  
  if (!course) return c.json({ error: 'Course not found' }, 404)

  const orderId = crypto.randomUUID()
  
  // DB에 대기중인 결제 정보 저장
  await db.db.prepare(
    'INSERT INTO payments (id, user_id, course_id, order_id, amount, status) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), user.id, course.id, orderId, course.price, 'pending').run()

  return c.json({
    orderId,
    amount: course.price,
    courseTitle: course.title,
    clientKey: 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm', // sample client key
    customerKey: btoa(user.id).slice(0, 20) // generate random or stable customer key
  })
})

payment.post('/confirm', async (c) => {
  const { paymentKey, orderId, amount } = await c.req.json()
  
  try {
    const toss = new TossClient(c.env.TOSS_SECRET_KEY || 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6')
    const result = await toss.confirmPayment({ paymentKey, orderId, amount }) as any

    if (result.status === 'DONE' || result.paymentKey) {
      const db = new Database(c.env.DB)
      
      // 1. 결제 상태 업데이트 (스키마에 맞게 updated_at 사용)
      await db.db.prepare(
        'UPDATE payments SET status = ?, payment_key = ?, updated_at = ? WHERE order_id = ?'
      ).bind('paid', paymentKey, new Date().toISOString(), orderId).run()

      // 2. 수강권 부여 (enrollments)
      const paymentRecord = await db.db.prepare('SELECT user_id, course_id FROM payments WHERE order_id = ?').bind(orderId).first<any>()
      
      if (paymentRecord) {
        await db.db.prepare(
          'INSERT OR IGNORE INTO enrollments (id, user_id, course_id, enrolled_at, status) VALUES (?, ?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), paymentRecord.user_id, paymentRecord.course_id, new Date().toISOString(), 'active').run()
      }
    }
    return c.json(result)
  } catch (err: any) {
    console.error('Payment confirmation error:', err)
    return c.json({ message: err.message || 'Internal Server Error' }, 500)
  }
})

payment.get('/success', async (c) => {
  return c.html(<PaymentSuccess />)
})

payment.get('/fail', (c) => {
  const message = c.req.query('message') || '결제 중 오류가 발생했습니다.'
  return c.html(<PaymentFail message={message} />)
})

export default payment
