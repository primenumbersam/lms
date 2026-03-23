DROP TABLE IF EXISTS progress;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  description_md TEXT,
  keywords TEXT,  -- SEO Keywords
  thumbnail_key TEXT,
  price INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'KRW',
  status TEXT DEFAULT 'draft',
  type TEXT DEFAULT 'course',
  access_days INTEGER DEFAULT 365,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT,
  video_uid TEXT,
  attachments TEXT,
  sort_order INTEGER DEFAULT 0,
  is_preview INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, slug)
);

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  course_id TEXT REFERENCES courses(id),
  order_id TEXT NOT NULL,
  payment_key TEXT,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  raw_response TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  course_id TEXT REFERENCES courses(id),
  payment_id TEXT REFERENCES payments(id),
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  status TEXT DEFAULT 'active'
);

CREATE TABLE progress (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  session_id TEXT REFERENCES sessions(id),
  completed INTEGER DEFAULT 0,
  completed_at DATETIME,
  UNIQUE(user_id, session_id)
);
