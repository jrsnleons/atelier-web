-- Parchment Web Database Schema with Multi-User RLS Security
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Daily notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  date DATE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

-- 2. Tasks table (untimed & scheduled)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  date DATE NOT NULL,
  text TEXT NOT NULL,
  priority SMALLINT DEFAULT 0 CHECK (priority BETWEEN 0 AND 3),
  list_tag VARCHAR(50) DEFAULT NULL,
  list_id VARCHAR(50) DEFAULT NULL,
  is_done BOOLEAN DEFAULT FALSE,
  start_time TIME DEFAULT NULL,
  end_time TIME DEFAULT NULL,
  sort_order SMALLINT DEFAULT 0,
  subtasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  date DATE NOT NULL,
  text TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME DEFAULT NULL,
  priority SMALLINT DEFAULT 0 CHECK (priority BETWEEN 0 AND 3),
  list_tag VARCHAR(50) DEFAULT NULL,
  list_id VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Calendar Feeds table
CREATE TABLE IF NOT EXISTS calendar_feeds (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. List Categories table
CREATE TABLE IF NOT EXISTS lists (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for high performance date-based queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_events_user_date ON events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_notes_user_date ON notes(user_id, date);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- Drop permissive public policies if present
DROP POLICY IF EXISTS "Allow all on notes" ON notes;
DROP POLICY IF EXISTS "Allow all on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all on events" ON events;

-- Create secure multi-user RLS policies
CREATE POLICY "Users access own notes" ON notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users access own tasks" ON tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users access own events" ON events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users access own feeds" ON calendar_feeds FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users access own lists" ON lists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable Supabase Realtime Engine for cross-browser synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE tasks, events, notes, lists, calendar_feeds;

