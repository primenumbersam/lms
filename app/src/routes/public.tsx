import { Hono } from 'hono'
import { Database } from '../lib/d1'
import { Bindings, Variables } from '../types'

// Import View Components
import { Home } from '../views/pages/Home'
import { CourseDetail } from '../views/pages/CourseDetail'
import { DownloadDetail } from '../views/pages/DownloadDetail'
import { MyCourses } from '../views/pages/MyCourses'
import { renderMarkdown } from '../lib/markdown'

const publicRoutes = new Hono<{ Bindings: Bindings, Variables: Variables }>()

publicRoutes.get('/', async (c) => {
  const user = c.get('user')
  const db = new Database(c.env.DB)
  const allItems = await db.getPublishedCourses()

  const courses = allItems.filter(item => item.type === 'course')
  const downloads = allItems.filter(item => item.type === 'download')

  return c.html(<Home user={user} courses={courses} downloads={downloads} />)
})

publicRoutes.get('/courses/:slug', async (c) => {
  const slug = c.req.param('slug')
  const db = new Database(c.env.DB)
  const course = await db.getCourseBySlug(slug)

  if (!course) return c.notFound()

  const user = c.get('user')
  
  const commonProps = {
    user,
    course: {
      ...course,
      descriptionHtml: renderMarkdown(course.description_md || course.description, course.slug)
    }
  }

  if (course.type === 'download') {
    return c.html(<DownloadDetail {...commonProps} />)
  }

  const sessions = await db.getSessionsByCourseId(course.id)
  return c.html(<CourseDetail {...commonProps} sessions={sessions} />)
})

publicRoutes.get('/dashboard', async (c) => {
  const user = c.get('user')
  if (!user) return c.redirect('/auth/google')
  const db = new Database(c.env.DB)
  const enrollments = await db.db.prepare(
    'SELECT courses.* FROM enrollments JOIN courses ON enrollments.course_id = courses.id WHERE enrollments.user_id = ?'
  ).bind(user.id).all<any>()
  
  return c.html(<MyCourses user={user} enrollments={enrollments.results} />)
})

export default publicRoutes
