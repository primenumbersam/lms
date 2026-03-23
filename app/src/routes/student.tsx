import { Hono } from 'hono'
import { Database } from '../lib/d1'
import { Bindings, Variables } from '../types'
import { renderMarkdown } from '../lib/markdown'
import { SessionViewer } from '../views/pages/SessionViewer'

const studentRoutes = new Hono<{ Bindings: Bindings, Variables: Variables }>()

studentRoutes.get('/courses/:slug/sessions/:sessionSlug', async (c) => {
  const user = c.get('user')
  const { slug, sessionSlug } = c.req.param()
  const db = new Database(c.env.DB)
  
  const course = await db.getCourseBySlug(slug)
  if (!course) return c.notFound()

  const session = await db.getSessionBySlug(course.id, sessionSlug)
  if (!session) return c.notFound()

  // 1. 만약 프리뷰 세션이면 로그인 없이도 접근 허용
  if (session.is_preview) {
    // 프리뷰 세션인 경우
    const sessions = await db.getSessionsByCourseId(course.id)
    const progress = user ? await db.getCourseProgress(user.id, course.id) : {}
    const currentIndex = sessions.findIndex(s => s.id === session.id)
    const prevSession = sessions[currentIndex - 1]
    const nextSession = sessions[currentIndex + 1]

    const contentHtml = renderMarkdown(session.content_md, course.slug, session.slug)
    const isCompleted = user && progress[session.id]

    return c.html(
      <SessionViewer 
        user={user} 
        course={course} 
        session={session} 
        sessions={sessions} 
        progress={progress || {}} 
        currentIndex={currentIndex} 
        prevSession={prevSession} 
        nextSession={nextSession} 
        contentHtml={contentHtml} 
        isCompleted={!!isCompleted} 
      />
    )
  }

  // 2. 프리뷰가 아닌 세션은 로그인 필수
  if (!user) return c.redirect('/auth/google')

  // 3. 등록 여부 확인 (구매 여부)
  const enrolled = await db.isEnrolled(user.id, course.id)
  if (!enrolled) {
    return c.redirect(`/courses/${slug}?error=enrolment_required`)
  }

  const sessions = await db.getSessionsByCourseId(course.id)
  const progress = await db.getCourseProgress(user.id, course.id)
  const currentIndex = sessions.findIndex(s => s.id === session.id)
  const prevSession = sessions[currentIndex - 1]
  const nextSession = sessions[currentIndex + 1]

  const contentHtml = renderMarkdown(session.content_md, course.slug, session.slug)
  const isCompleted = progress && progress[session.id] ? true : false

  return c.html(
    <SessionViewer 
      user={user} 
      course={course} 
      session={session} 
      sessions={sessions} 
      progress={progress || {}} 
      currentIndex={currentIndex} 
      prevSession={prevSession} 
      nextSession={nextSession} 
      contentHtml={contentHtml} 
      isCompleted={isCompleted} 
    />
  )
})

studentRoutes.post('/sessions/:sessionId/progress', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const sessionId = c.req.param('sessionId')
  const { completed } = await c.req.json() as { completed: boolean }
  
  const db = new Database(c.env.DB)
  await db.setProgress(user.id, sessionId, completed)
  
  return c.json({ success: true })
})

studentRoutes.get('/downloads/:slug/download', async (c) => {
  const user = c.get('user')
  if (!user) return c.redirect('/auth/google')

  const slug = c.req.param('slug')
  const db = new Database(c.env.DB)
  
  const download = await db.getCourseBySlug(slug)
  if (!download || download.type !== 'download') return c.notFound()

  // Check payment
  const paid = await db.db.prepare(
    'SELECT id FROM payments WHERE user_id = ? AND course_id = ? AND status = "paid"'
  ).bind(user.id, download.id).first()

  if (!paid) {
    return c.redirect(`/courses/${slug}?error=payment_required`)
  }

  // Generate R2 URL (In real app, this would be a Presigned URL)
  const downloadUrl = `/assets/courses/${slug}/resource.zip`
  
  return c.redirect(downloadUrl)
})

export default studentRoutes
