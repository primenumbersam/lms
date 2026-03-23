export type User = {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role: 'admin' | 'student'
  created_at: string
  updated_at: string
}

export type Course = {
  id: string
  slug: string
  title: string
  description?: string
  description_md?: string
  keywords?: string  // SEO Keywords
  thumbnail_key?: string
  price: number
  currency: string
  status: 'draft' | 'published' | 'archived'
  type: 'course' | 'download'
  access_days: number
  created_at: string
  updated_at: string
}

export type Session = {
  id: string
  course_id: string
  slug: string
  title: string
  content_md?: string
  video_uid?: string
  attachments?: string // JSON string array
  sort_order: number
  is_preview: number // 0 or 1
  created_at: string
  updated_at: string
}

export type Enrollment = {
  id: string
  user_id: string
  course_id: string
  payment_id?: string
  enrolled_at: string
  expires_at?: string
  status: 'active' | 'expired' | 'revoked'
}

export type Variables = {
  user: {
    id: string
    email: string
    role: string
  } | null
}

export type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  JWT_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  TOSS_SECRET_KEY: string
}
