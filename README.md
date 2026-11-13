# TaskFlow — Full-Stack Task Manager

A complete Week 3 internship mini project for task tracking, built with React, Express and MongoDB.

## Features

- User registration and login with JWT authentication
- Password hashing with bcrypt
- Protected, user-specific task APIs
- Create, edit, delete and complete tasks
- Low, medium and high priority
- Optional due dates and descriptions
- Search by task title
- Filter by task status and priority
- Dashboard statistics
- Responsive React interface

## Tech Stack

- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- Lucide React

## Project Structure

```
Task-Manager-InternshipW3/
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
├── .gitignore
└── README.md
```

## Local Setup

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Configure `MONGO_URI` and `JWT_SECRET` in `.env`.

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend uses `http://localhost:5173` and the API defaults to `http://localhost:5000/api`.

## API

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
PATCH  /api/tasks/:id/status
DELETE /api/tasks/:id
```

## Security

JWT protects task routes, passwords are hashed before storage, and every task is scoped to the authenticated user.

## Environment

Never commit `.env`. Use the included `.env.example` files as templates.
