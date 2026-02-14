# College Event & Club Management System

A professional full-stack web application to manage college clubs, events, registrations, notifications, and analytics with strict role-based access.

## Table of Contents

- Overview
- Features
- Tech Stack
- Architecture
- Role Permissions Matrix
- Project Structure
- Prerequisites
- Quick Start (Local)
- Environment Variables
- Seed Data
- API Reference
- Security Practices
- File Uploads and Emails
- Troubleshooting
- Current Scope and Future Enhancements

## Overview

This system supports three user roles:

- `admin`: platform governance, approvals, analytics, and user management
- `leader`: club and event management for their own club
- `student`: club/event discovery and event registrations

It includes JWT auth, REST APIs, MongoDB schemas, file upload for event posters, email notifications, and analytics charts.

## Features

### Core Features Implemented

1. User Authentication & Roles
- Sign up / login / logout
- JWT token-based authentication
- Role-based authorization for backend APIs and frontend routes

2. Club Management
- Admin can create, update, delete clubs
- Admin can approve/reject club creation requests
- Students and leaders can browse clubs
- Club leaders can manage their own club details

3. Event Management
- Leaders/admin can create, edit, and delete events
- Event fields: title, description, date, venue, category, capacity, poster image
- Event poster upload (JPG/PNG/WEBP)

4. Event Registration
- Students can register for events
- Duplicate registration prevented
- Students can view registered events on profile page

5. Notifications
- Registration confirmation email
- Automated reminder emails approximately 24 hours before event start

6. Admin Dashboard
- Manage users and role updates
- Approve/reject club requests
- Analytics:
  - upcoming events count
  - total registrations
  - student count per club chart
  - registration trend chart
- Export registrations to CSV

7. Responsive Frontend
- React SPA + React Router
- Tailwind CSS responsive layout for desktop/mobile

8. Backend APIs
- RESTful API design
- JWT auth middleware + RBAC middleware

9. Database
- MongoDB with Mongoose models for Users, Clubs, Events, Registrations

10. Search & Filter
- Club search and category filter
- Event search + filters by category/date/club

11. Security & Validation
- Password hashing (bcrypt)
- Request validation (express-validator)
- MongoDB query sanitization
- Protected routes and role checks

## Tech Stack

Frontend:
- React (Vite)
- React Router
- Axios
- Tailwind CSS
- Recharts

Backend:
- Node.js
- Express.js
- Mongoose
- JWT
- Multer
- Nodemailer
- Node-cron

Database:
- MongoDB

## Architecture

- Frontend calls backend REST API using Axios
- Backend handles auth, authorization, business logic, validation
- MongoDB stores application entities
- Uploaded posters are stored in `backend/uploads`
- Scheduler checks hourly for upcoming events and sends reminders

## Role Permissions Matrix

| Action | Admin | Leader | Student |
|---|---|---|---|
| Register/Login | Yes | Yes | Yes |
| View clubs/events | Yes | Yes | Yes |
| Request club creation | No (not needed) | Yes | Yes |
| Approve/reject club requests | Yes | No | No |
| Manage users | Yes | No | No |
| Create/update/delete clubs | Yes | Own club update only | No |
| Create/update/delete events | Yes | Own club events | No |
| Register for event | No | No | Yes |
| View my registrations | No | No | Yes |
| View analytics dashboard | Yes | No | No |
| Export registrations CSV | Yes | No | No |

## Project Structure

```text
college-management-system/
  backend/
    config/
      db.js
    controllers/
      adminController.js
      authController.js
      clubController.js
      eventController.js
      registrationController.js
    middleware/
      auth.js
      errorHandler.js
      validate.js
    models/
      User.js
      Club.js
      Event.js
      Registration.js
    routes/
      adminRoutes.js
      authRoutes.js
      clubRoutes.js
      eventRoutes.js
      registrationRoutes.js
    scripts/
      seed.js
    uploads/
      .gitkeep
    utils/
      email.js
      reminderJob.js
      upload.js
    app.js
    server.js
    package.json
    .env.example
  frontend/
    src/
      components/
        Navbar.jsx
        ProtectedRoute.jsx
      context/
        AuthContext.jsx
      pages/
        AdminDashboard.jsx
        Clubs.jsx
        Events.jsx
        Home.jsx
        LeaderDashboard.jsx
        Login.jsx
        Profile.jsx
        Register.jsx
        Unauthorized.jsx
      services/
        api.js
      App.jsx
      main.jsx
      index.css
    index.html
    package.json
    .env.example
    postcss.config.js
    tailwind.config.js
    vite.config.js
  .gitignore
  README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB running locally or remotely

## Quick Start (Local)

### 1) Backend Setup

```bash
cd college-management-system/backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

Backend starts at: `http://localhost:5000`

### 2) Frontend Setup

Open a new terminal:

```bash
cd college-management-system/frontend
npm install
copy .env.example .env
npm run dev
```

Frontend starts at: `http://localhost:5173`

## Environment Variables

### Backend: `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/college_event_club
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password_or_app_password
EMAIL_FROM=College Event System <noreply@example.com>
```

### Frontend: `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
```

## Seed Data

Seed script creates demo users and starter data.

Run:

```bash
cd college-management-system/backend
npm run seed
```

Demo credentials:
- Admin: `admin@college.com` / `password123`
- Leader: `leader@college.com` / `password123`
- Student: `student@college.com` / `password123`

## API Reference

Base URL: `http://localhost:5000/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Clubs
- `GET /clubs`
- `GET /clubs/:id`
- `POST /clubs/request` (student/leader)
- `POST /clubs` (admin)
- `PUT /clubs/:id` (admin/leader own club)
- `DELETE /clubs/:id` (admin)

### Events
- `GET /events`
- `GET /events/:id`
- `POST /events` (leader/admin; `multipart/form-data`, poster key: `poster`)
- `PUT /events/:id` (leader/admin)
- `DELETE /events/:id` (leader/admin)

### Registrations
- `POST /registrations/events/:eventId/register` (student)
- `GET /registrations/my` (student)

### Admin
- `GET /admin/users`
- `PATCH /admin/users/:id`
- `GET /admin/club-requests`
- `PATCH /admin/club-requests/:id`
- `GET /admin/analytics`
- `GET /admin/export/registrations.csv`

## API Examples (Request/Response)

Use header for protected routes:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### 1) Register User

`POST /api/auth/register`

Request:

```json
{
  "name": "John Student",
  "email": "john@student.com",
  "password": "password123",
  "role": "student",
  "interests": ["technology", "music"]
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67c1234567890abcdef1234",
    "name": "John Student",
    "email": "john@student.com",
    "role": "student",
    "interests": ["technology", "music"]
  }
}
```

### 2) Login

`POST /api/auth/login`

Request:

```json
{
  "email": "student@college.com",
  "password": "password123"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67c1234567890abcdef1234",
    "name": "Student User",
    "email": "student@college.com",
    "role": "student",
    "interests": ["sports", "art"]
  }
}
```

### 3) Club Request (Student/Leader)

`POST /api/clubs/request`

Request:

```json
{
  "name": "Photography Club",
  "description": "A club for photo walks, editing sessions, and competitions.",
  "category": "Arts"
}
```

Response:

```json
{
  "_id": "67c1234567890abcdef2234",
  "name": "Photography Club",
  "description": "A club for photo walks, editing sessions, and competitions.",
  "category": "Arts",
  "leader": "67c1234567890abcdef1234",
  "createdBy": "67c1234567890abcdef1234",
  "status": "pending",
  "createdAt": "2026-02-14T09:00:00.000Z",
  "updatedAt": "2026-02-14T09:00:00.000Z"
}
```

### 4) Create Event (Leader/Admin, Multipart)

`POST /api/events`

Form-data fields:
- `title`: `AI Workshop`
- `description`: `Hands-on session on ML fundamentals`
- `date`: `2026-03-10T14:00`
- `venue`: `Seminar Hall A`
- `category`: `Workshop`
- `capacity`: `150`
- `club`: `<club_id>`
- `poster`: `<image_file>`

Response:

```json
{
  "_id": "67c1234567890abcdef3234",
  "title": "AI Workshop",
  "description": "Hands-on session on ML fundamentals",
  "date": "2026-03-10T14:00:00.000Z",
  "venue": "Seminar Hall A",
  "category": "Workshop",
  "capacity": 150,
  "posterImage": "/uploads/1739520000000-123456789.png",
  "club": "67c1234567890abcdef2234",
  "createdBy": "67c1234567890abcdef1234"
}
```

### 5) Register for Event (Student)

`POST /api/registrations/events/:eventId/register`

Response:

```json
{
  "_id": "67c1234567890abcdef4234",
  "event": "67c1234567890abcdef3234",
  "student": "67c1234567890abcdef1234",
  "status": "registered",
  "createdAt": "2026-02-14T09:10:00.000Z",
  "updatedAt": "2026-02-14T09:10:00.000Z"
}
```

### 6) Fetch Events with Search/Filters

`GET /api/events?search=workshop&category=tech&club=<club_id>&dateFrom=2026-03-01&dateTo=2026-03-31`

Response:

```json
[
  {
    "_id": "67c1234567890abcdef3234",
    "title": "AI Workshop",
    "date": "2026-03-10T14:00:00.000Z",
    "venue": "Seminar Hall A",
    "category": "Workshop",
    "club": {
      "_id": "67c1234567890abcdef2234",
      "name": "Tech Innovators Club"
    }
  }
]
```

### 7) Admin Approve Club Request

`PATCH /api/admin/club-requests/:id`

Request:

```json
{
  "action": "approve"
}
```

Response:

```json
{
  "_id": "67c1234567890abcdef2234",
  "name": "Photography Club",
  "status": "approved",
  "rejectionReason": ""
}
```

### 8) Admin Analytics

`GET /api/admin/analytics`

Response:

```json
{
  "summary": {
    "upcomingEvents": 6,
    "totalRegistrations": 134
  },
  "studentsPerClub": [
    { "_id": "Tech Innovators Club", "studentCount": 58 },
    { "_id": "Music Club", "studentCount": 30 }
  ],
  "registrationTrend": [
    { "_id": "2026-02-10", "count": 4 },
    { "_id": "2026-02-11", "count": 8 }
  ]
}
```

## Security Practices

- Passwords hashed using bcrypt (`User` model middleware)
- JWT signed with secret and expiry
- Role checks on protected backend routes
- Input validation with `express-validator`
- Query sanitization with `express-mongo-sanitize`
- Helmet for secure HTTP headers

## File Uploads and Emails

- Posters are saved in `backend/uploads`
- Static poster serving path: `/uploads/<filename>`
- If SMTP values are missing, the app runs normally and logs email as skipped
- Reminder scheduler runs hourly and sends reminders for events ~24 hours away

## Troubleshooting

1. Mongo connection error
- Verify MongoDB is running and `MONGO_URI` is correct.

2. CORS errors
- Ensure `FRONTEND_URL` in backend `.env` matches frontend origin.

3. 401/403 API responses
- Confirm user role permissions and valid `Authorization: Bearer <token>` header.

4. Email not sending
- Check SMTP credentials and provider security settings (app password, SMTP enabled).

5. Poster upload fails
- Ensure image type is JPG/PNG/WEBP and size < 5MB.

## Current Scope and Future Enhancements

Implemented now:
- Complete core requirements
- CSV export (optional enhancement)

Not implemented yet (possible next extensions):
- Real-time club chat
- AI-based event suggestions
- Calendar grid/month view
- Admin-generated certificates
