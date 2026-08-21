# Agile Kanban

A full-stack Kanban task management application built with React, Node.js, Express, PostgreSQL, and Vercel.

## Live Demo

**[Open Agile Kanban](https://agile-kanban.vercel.app/)**

## Overview

Agile Kanban is a personal task and project management workspace designed around a Kanban workflow.

Users can create boards, organize work into columns, create and manage tasks, assign priorities, and move tasks using drag-and-drop.

The application also provides a dashboard with task statistics and progress information.

## Features

* User registration and login
* JWT-based authentication
* Protected API routes
* Multiple Kanban boards
* Custom board columns
* Task creation, editing, and deletion
* Task descriptions
* Low, Medium, and High priorities
* Drag-and-drop task reordering
* Task completion tracking through the Done column
* Search tasks
* Filter tasks by priority
* Task statistics dashboard
* Completion percentage
* Priority breakdown
* Responsive glass-style UI
* Production deployment with Vercel
* PostgreSQL database hosted on Neon

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Lucide React
* @hello-pangea/dnd

### Backend

* Node.js
* Express
* JWT
* bcryptjs
* PostgreSQL
* pg

### Infrastructure

* Vercel
* Neon PostgreSQL
* GitHub

## Architecture

```text
React + Vite
     │
     │ HTTP / JSON
     ▼
Express API
     │
     │ PostgreSQL queries
     ▼
Neon PostgreSQL
```

Authentication works through JWTs:

```text
Login / Register
       │
       ▼
Express API
       │
       ├── bcrypt password verification
       │
       └── JWT generation
              │
              ▼
        React localStorage
              │
              ▼
      Protected API requests
```

## API

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Boards

```text
GET    /api/boards
POST   /api/boards
GET    /api/boards/:boardId/full
DELETE /api/boards/:boardId
```

### Columns

```text
POST   /api/columns
PUT    /api/columns/:columnId
DELETE /api/columns/:columnId
```

### Tasks

```text
POST   /api/tasks
PUT    /api/tasks/:taskId
DELETE /api/tasks/:taskId
POST   /api/tasks/reorder
```

## Local Development

### Prerequisites

* Node.js
* npm
* PostgreSQL-compatible database

### Clone

```bash
git clone https://github.com/RaoMuhammadUmar/agile-kanban.git
cd agile-kanban
```

### Backend

```bash
cd server
npm install
npm run dev
```

The API runs on:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Environment Variables

### Backend

Create:

```text
server/.env
```

Example:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_ORIGIN=http://localhost:5173
PORT=5000
```

### Frontend

Create:

```text
client/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

Do not commit real credentials or secrets.

## Database

The project uses PostgreSQL for persistent application data.

The main relationships are:

```text
users
  │
  └── boards
        │
        └── columns
              │
              └── tasks
```

A task belongs to a column, and a column belongs to a board owned by a user.

## Dashboard

The application calculates board statistics from the existing task data.

The dashboard provides:

* Total tasks
* Completed tasks
* Remaining tasks
* High-priority tasks
* Completion percentage
* Priority distribution

A task is currently considered completed when it is placed in the `Done` column.

## Deployment

The production application is deployed on Vercel.

Frontend:

```text
https://agile-kanban.vercel.app/
```

Backend API:

```text
https://agile-kanban.vercel.app/api
```

The repository is connected to Vercel, so pushes to the `main` branch trigger a new deployment.

## What I Learned

This project was used to practice building and deploying a complete full-stack application, including:

* REST API design
* Express middleware
* JWT authentication
* Password hashing
* PostgreSQL queries
* Database relationships
* Authorization
* React state management
* Drag-and-drop interfaces
* Environment variables
* CORS
* Vercel serverless deployment
* Neon PostgreSQL deployment
* Production debugging

## Author

**Rao Muhammad Umar**

* GitHub: https://github.com/RaoMuhammadUmar
* LinkedIn: https://linkedin.com/in/rao-umar-a15668330
* Portfolio: https://raomuhammadumar.github.io/rao-umar-portfolio
