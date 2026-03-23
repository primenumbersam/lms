-- D1 Initial Schema for Mini-LMS

-- 1. Users
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- UUID
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student', -- 'admin' | 'student'
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 2. Courses
CREATE TABLE courses (
    id TEXT PRIMARY KEY, -- UUID
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_key TEXT,
    price INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'KRW',
    status TEXT DEFAULT 'draft', -- 'draft' | 'published' | 'archived'
    type TEXT DEFAULT 'course', -- 'course' | 'download'
    access_days INTEGER DEFAULT 365,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 3. Sessions
CREATE TABLE sessions (
    id TEXT PRIMARY KEY, -- UUID
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    content_md TEXT,
    video_uid TEXT,
    attachments TEXT, -- JSON array ["pdfs/xxx.pdf"]
    sort_order INTEGER DEFAULT 0,
    is_preview INTEGER DEFAULT 0, -- 1 = true
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE(course_id, slug)
);

-- 4. Payments
CREATE TABLE payments (
    id TEXT PRIMARY KEY, -- UUID
    user_id TEXT NOT NULL REFERENCES users(id),
    course_id TEXT NOT NULL REFERENCES courses(id),
    order_id TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    pg_provider TEXT DEFAULT 'toss',
    payment_key TEXT,
    status TEXT DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded' | 'partial_refunded'
    paid_at TEXT,
    refund_amount INTEGER DEFAULT 0,
    refund_reason TEXT,
    refunded_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 5. Enrollments
CREATE TABLE enrollments (
    id TEXT PRIMARY KEY, -- UUID
    user_id TEXT NOT NULL REFERENCES users(id),
    course_id TEXT NOT NULL REFERENCES courses(id),
    payment_id TEXT REFERENCES payments(id),
    enrolled_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    expires_at TEXT, -- NULL for download type
    status TEXT DEFAULT 'active', -- 'active' | 'expired' | 'revoked'
    UNIQUE(user_id, course_id)
);

-- 6. Progress
CREATE TABLE progress (
    id TEXT PRIMARY KEY, -- UUID
    user_id TEXT NOT NULL REFERENCES users(id),
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    completed INTEGER DEFAULT 0,
    completed_at TEXT,
    UNIQUE(user_id, session_id)
);

-- Triggers for updated_at
CREATE TRIGGER IF NOT EXISTS users_updated_at AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS courses_updated_at AFTER UPDATE ON courses
BEGIN
    UPDATE courses SET updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS sessions_updated_at AFTER UPDATE ON sessions
BEGIN
    UPDATE sessions SET updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;
