# Agile Workspace — Kanban Board

Full-stack Trello-style Kanban board: React + Tailwind frontend, Express + Supabase
Postgres backend, JWT auth, and drag-and-drop tasks (via `@hello-pangea/dnd`).

```
agile-kanban/
├── schema.sql              # run this in Supabase's SQL editor first
├── server/                 # Express API
│   ├── server.js
│   ├── db.js
│   ├── middleware/auth.js
│   └── routes/{auth,boards,columns,tasks}.js
└── client/                 # React (Vite) frontend
    └── src/
        ├── App.jsx
        ├── api.js
        ├── context/AuthContext.jsx
        └── components/{Login,Register,BoardList,KanbanBoard,Navbar,Column,TaskCard,TaskModal}.jsx
```

## 1. Set up the database (Supabase)

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Go to **SQL Editor → New query**, paste the contents of `schema.sql`, and run it.
   This creates `users`, `boards`, `columns`, and `tasks` tables.
3. Go to **Project Settings → Database → Connection string → URI** and copy it
   (use the direct connection on port `5432`, not the pooled `6543` one — this
   server keeps a long-lived connection pool rather than being serverless).

## 2. Run the backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — the Supabase connection string from step 1 (fill in your password)
- `JWT_SECRET` — any long random string, e.g. generate one with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `CLIENT_ORIGIN` — leave as `http://localhost:5173` for local dev

```bash
npm run dev
```

The API starts on `http://localhost:5000`. Check `http://localhost:5000/api/health`
to confirm it's up.

## 3. Run the frontend

In a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Register an account, create a board, and you're in.

## How it fits together

- **Auth**: `POST /api/auth/register` and `/login` return a JWT, stored in
  `localStorage` and attached as `Authorization: Bearer <token>` on every
  request (see `client/src/api.js`). `server/middleware/auth.js` verifies it
  on every protected route.
- **Boards → Columns → Tasks**: every board starts with three default columns
  (To Do / In Progress / Done). `GET /api/boards/:id/full` returns the whole
  board nested (columns with their tasks) in one call for the board view.
- **Drag-and-drop**: `KanbanBoard.jsx` updates local state optimistically on
  drop, then calls `POST /api/tasks/reorder` with the full ordered task-id
  list for each affected column. The endpoint runs the position/column
  updates in a single transaction (see `server/routes/tasks.js`).
- **Ownership checks**: every board/column/task route re-verifies that the
  requesting user (from the JWT) actually owns the board a resource belongs
  to, via joins back to `boards.user_id` — so one user can never read or
  modify another's data.

## Notes / things to harden before shipping this for real

- Row Level Security is intentionally left off in `schema.sql` (see the note
  at the bottom of that file) since this app authenticates through its own
  Express/JWT layer rather than Supabase Auth. If you later move to
  Supabase's client SDK + Supabase Auth, enable RLS and write policies keyed
  off `auth.uid()`.
- There's no rate limiting on `/api/auth/*` — add something like
  `express-rate-limit` before exposing this publicly.
- No board sharing/collaborators yet — boards are single-owner only.
