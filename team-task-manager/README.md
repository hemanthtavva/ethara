# Team Task Manager

A full-stack team task management application with role-based access control, project management, task tracking, and overdue alerts.

## GitHub Repo

https://github.com/hemanthtavva/ethara

## Tech Stack

| Layer          | Technology                  |
| -------------- | --------------------------- |
| Frontend       | React.js + Tailwind CSS     |
| Backend        | Node.js + Express.js        |
| Database       | PostgreSQL                  |
| ORM            | Prisma                      |
| Authentication | JWT (Access Tokens)         |
| Icons          | Lucide React                |
| Deployment     | Railway                     |

## Features

- **Authentication**: Signup/Login with JWT-based auth
- **Role-Based Access Control**: Admin and Member roles with distinct permissions
- **Project Management**: Create, update, delete projects (Admin)
- **Team Management**: Add/remove members from projects (Admin)
- **Task Management**: Create, assign, update, delete tasks
- **Task Filtering**: Filter by status, priority, and assignee
- **Overdue Tracking**: Automatic detection and highlighting of overdue tasks
- **Dashboard**: Summary cards, recent tasks, overdue alerts
- **Responsive UI**: Mobile-friendly design with Tailwind CSS

## Role Access Table

| Feature                     | Admin | Member |
| --------------------------- | ----- | ------ |
| Create/Edit/Delete Projects | ✅     | ❌      |
| Add/Remove Project Members  | ✅     | ❌      |
| Create/Assign/Delete Tasks  | ✅     | ❌      |
| View All Projects & Tasks   | ✅     | ❌      |
| View Own Projects           | ✅     | ✅      |
| View Own Tasks              | ✅     | ✅      |
| Update Own Task Status      | ✅     | ✅      |
| Manage Team Page            | ✅     | ❌      |

## Setup Instructions (Local)

### Prerequisites

- Node.js >= 18
- PostgreSQL running locally
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/hemanthtavva/ethara.git
cd team-task-manager
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
DATABASE_URL=postgresql://<your_user>@localhost:5432/team_task_manager
JWT_SECRET=<your_secret_key>
PORT=5001
NODE_ENV=development
```

Run Prisma migrations and generate the client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:5001
```

Start the frontend dev server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5001`.

## API Documentation

### Auth Routes (`/api/auth`)

| Method | Endpoint   | Description      | Auth |
| ------ | ---------- | ---------------- | ---- |
| POST   | `/signup`  | Register user    | No   |
| POST   | `/login`   | Login, get JWT   | No   |
| GET    | `/me`      | Get current user | Yes  |

### User Routes (`/api/users`) — Admin Only

| Method | Endpoint | Description    | Auth  |
| ------ | -------- | -------------- | ----- |
| GET    | `/`      | List all users | Admin |
| GET    | `/:id`   | Get user by ID | Admin |

### Project Routes (`/api/projects`)

| Method | Endpoint               | Description            | Auth  |
| ------ | ---------------------- | ---------------------- | ----- |
| POST   | `/`                    | Create project         | Admin |
| GET    | `/`                    | Get user's projects    | Yes   |
| GET    | `/:id`                 | Get project details    | Yes   |
| PUT    | `/:id`                 | Update project         | Admin |
| DELETE | `/:id`                 | Delete project         | Admin |
| POST   | `/:id/members`         | Add member to project  | Admin |
| DELETE | `/:id/members/:userId` | Remove member          | Admin |

### Task Routes (`/api/tasks`)

| Method | Endpoint             | Description          | Auth  |
| ------ | -------------------- | -------------------- | ----- |
| POST   | `/`                  | Create task          | Admin |
| GET    | `/`                  | Get user's tasks     | Yes   |
| GET    | `/overdue`           | Get overdue tasks    | Yes   |
| GET    | `/:id`               | Get task details     | Yes   |
| PUT    | `/:id`               | Update task          | Yes   |
| DELETE | `/:id`               | Delete task          | Admin |
| GET    | `/project/:projectId`| Get tasks by project | Yes   |

## Railway Deployment

### 1. Backend Service

- **Build command**: `npm install`
- **Start command**: `npm start` (runs prisma migrate deploy + node src/server.js)
- **Environment variables**:
  - `DATABASE_URL` — from Railway PostgreSQL plugin
  - `JWT_SECRET` — your secret key
  - `PORT` — 5001
  - `NODE_ENV` — production
  - `FRONTEND_URL` — your frontend Railway URL

### 2. Frontend Service

- **Build command**: `npm run build`
- **Start command**: `npx serve -s dist`
- **Environment variables**:
  - `VITE_API_URL` — your backend Railway URL

### 3. PostgreSQL

- Add Railway PostgreSQL plugin
- Copy the `DATABASE_URL` to the backend environment variables

---

Built with React, Express, PostgreSQL, and Prisma.
