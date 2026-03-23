import { Course, Session, User } from '../types'

export class Database {
  constructor(public db: D1Database) {}

  // Course methods
  async getPublishedCourses(): Promise<Course[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM courses WHERE status = ? ORDER BY created_at DESC')
      .bind('published')
      .all<Course>()
    return results
  }

  async getCourseBySlug(slug: string): Promise<Course | null> {
    return await this.db
      .prepare('SELECT * FROM courses WHERE slug = ?')
      .bind(slug)
      .first<Course>()
  }

  async getSessionsByCourseId(courseId: string): Promise<Session[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM sessions WHERE course_id = ? ORDER BY sort_order ASC')
      .bind(courseId)
      .all<Session>()
    return results
  }

  // User methods
  async getUserByEmail(email: string): Promise<User | null> {
    return await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<User>()
  }

  async createUser(user: Partial<User>): Promise<void> {
    await this.db
      .prepare(
        'INSERT INTO users (id, email, name, avatar_url, role) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(user.id, user.email, user.name, user.avatar_url, user.role || 'student')
      .run()
  }

  async getSessionBySlug(courseId: string, slug: string): Promise<Session | null> {
    return await this.db
      .prepare('SELECT * FROM sessions WHERE course_id = ? AND slug = ?')
      .bind(courseId, slug)
      .first<Session>()
  }

  async getProgress(userId: string, sessionId: string): Promise<any> {
    return await this.db
      .prepare('SELECT * FROM progress WHERE user_id = ? AND session_id = ?')
      .bind(userId, sessionId)
      .first()
  }

  async setProgress(userId: string, sessionId: string, completed: boolean): Promise<void> {
    const id = crypto.randomUUID()
    await this.db
      .prepare(
        'INSERT INTO progress (id, user_id, session_id, completed, completed_at) VALUES (?, ?, ?, ?, ?) ' +
        'ON CONFLICT(user_id, session_id) DO UPDATE SET completed = EXCLUDED.completed, completed_at = EXCLUDED.completed_at'
      )
      .bind(
        id, 
        userId, 
        sessionId, 
        completed ? 1 : 0, 
        completed ? new Date().toISOString() : null
      )
      .run()
  }

  async getCourseProgress(userId: string, courseId: string): Promise<Record<string, boolean>> {
    const { results } = await this.db
      .prepare(
        'SELECT session_id, completed FROM progress WHERE user_id = ? AND session_id IN (SELECT id FROM sessions WHERE course_id = ?)'
      )
      .bind(userId, courseId)
      .all<any>()
    
    const progress: Record<string, boolean> = {}
    results.forEach((r: any) => {
      progress[r.session_id] = !!r.completed
    })
    return progress
  }

  // Security checks
  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.db
      .prepare(
        'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND (expires_at IS NULL OR expires_at > datetime("now")) AND status = "active"'
      )
      .bind(userId, courseId)
      .first()
    return !!enrollment
  }
}
