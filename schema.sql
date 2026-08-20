-- ============================================================
-- Agile Task Management Workspace — Supabase Postgres Schema
-- Paste this entire file into: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================

-- Extension for UUID generation
create extension if not exists "pgcrypto";

-- ---------------------------
-- USERS
-- ---------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------
-- BOARDS
-- ---------------------------
create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_boards_user_id on boards(user_id);

-- ---------------------------
-- COLUMNS
-- ---------------------------
create table if not exists columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_columns_board_id on columns(board_id);

-- ---------------------------
-- TASKS
-- ---------------------------
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  column_id uuid not null references columns(id) on delete cascade,
  title text not null,
  description text default '',
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_tasks_column_id on tasks(column_id);

-- ---------------------------
-- NOTE ON ROW LEVEL SECURITY
-- ---------------------------
-- This project authenticates using its own Express + JWT layer (not Supabase Auth),
-- and the Node server connects with the full Postgres connection string, which
-- bypasses RLS by default via the postgres role. So RLS is left disabled here.
-- If you later switch to Supabase's client-side SDK + Supabase Auth, you should
-- enable RLS on every table above and write policies keyed off auth.uid().
