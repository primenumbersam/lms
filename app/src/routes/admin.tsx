import { Hono } from 'hono'
import { Database } from '../lib/d1'
import { Bindings, Variables } from '../types'
import { Dashboard } from '../views/admin/Dashboard'
import { adminMiddleware } from '../middleware/auth'

const adminRoutes = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// Admin Middleware Apply
adminRoutes.use('*', adminMiddleware)

// Redirect /admin to /admin/dashboard
adminRoutes.get('/', (c) => c.redirect('/admin/dashboard'))

adminRoutes.get('/dashboard', async (c) => {
  const user = c.get('user')
  const db = new Database(c.env.DB)
  
  const stats = await db.db.prepare(
    `SELECT 
      (SELECT COUNT(*) FROM users) as total_users, 
      (SELECT COUNT(*) FROM courses WHERE type = 'course') as total_courses, 
      (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'paid') as total_revenue, 
      (SELECT COUNT(*) FROM enrollments) as total_enrollments`
  ).first<any>()

  const recentPayments = await db.db.prepare(
    `SELECT payments.*, users.email as user_email, courses.title as course_title 
    FROM payments 
    JOIN users ON payments.user_id = users.id 
    JOIN courses ON payments.course_id = courses.id 
    ORDER BY payments.created_at DESC LIMIT 5`
  ).all<any>()

  const courses = await db.db.prepare(
    `SELECT id, slug, title, type, price, status, updated_at FROM courses ORDER BY updated_at DESC`
  ).all<any>()

  return c.html(<Dashboard user={user} stats={stats} recentPayments={recentPayments.results} courses={courses.results} />)
})

adminRoutes.post('/upload', async (c) => {
  const form = await c.req.formData()
  const file = form.get('file') as any
  const key = form.get('key') as string

  if (!file || !key) return c.json({ success: false, message: 'Missing file or key' }, 400)

  const arrayBuffer = await file.arrayBuffer()
  await c.env.BUCKET.put(key, arrayBuffer, {
    httpMetadata: { contentType: file.type }
  })

  return c.json({ success: true, key })
})

adminRoutes.post('/sync', async (c) => {
  const data = await c.req.json() as any
  const db = new Database(c.env.DB)
  
  const course = data.course
  const existingCourse = await db.getCourseBySlug(course.slug)
  const courseId = existingCourse ? existingCourse.id : crypto.randomUUID()
  
  await db.db.prepare(
    `INSERT INTO courses (id, slug, title, description, description_md, keywords, price, status, type, access_days, thumbnail_key, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
    ON CONFLICT(slug) DO UPDATE SET 
      title=EXCLUDED.title, 
      description=EXCLUDED.description, 
      description_md=EXCLUDED.description_md, 
      keywords=EXCLUDED.keywords,
      price=EXCLUDED.price, 
      status=EXCLUDED.status, 
      type=EXCLUDED.type, 
      access_days=EXCLUDED.access_days, 
      thumbnail_key=EXCLUDED.thumbnail_key, 
      updated_at=EXCLUDED.updated_at`
  ).bind(
    courseId,
    course.slug,
    course.title,
    course.description || null,
    course.description_md || null,
    course.keywords || null,
    course.price || 0,
    course.status || 'draft',
    course.type || 'course',
    course.access_days || 365,
    course.thumbnail_key || null,
    new Date().toISOString()
  ).run()

  if (data.sessions && Array.isArray(data.sessions)) {
    for (const session of data.sessions) {
      await db.db.prepare(
        `INSERT INTO sessions (id, course_id, slug, title, content_md, video_uid, sort_order, is_preview, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
        ON CONFLICT(course_id, slug) DO UPDATE SET title=EXCLUDED.title, content_md=EXCLUDED.content_md, 
        video_uid=EXCLUDED.video_uid, sort_order=EXCLUDED.sort_order, is_preview=EXCLUDED.is_preview, updated_at=EXCLUDED.updated_at`
      ).bind(
        crypto.randomUUID(),
        courseId,
        session.slug,
        session.title,
        session.content_md || null,
        session.video_uid || null,
        session.sort_order || 0,
        session.is_preview ? 1 : 0,
        new Date().toISOString()
      ).run()
    }
  }

  return c.json({ success: true, courseId })
})

export default adminRoutes
