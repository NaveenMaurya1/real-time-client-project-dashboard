Link of live web app : https://real-time-client-project-dashboard-liard.vercel.app/

use username: admin@dashboard.com
use username: pm1@dashboard.com
use username: pm2@dashboard.com
use username: dev1@dashboard.com
use username: dev2@dashboard.com
use username: dev3@dashboard.com
use username: dev4@dashboard.com
use password: Password123!

# Real-Time Client Project Dashboard

A full-stack internal agency dashboard with role-based access control, task management, real-time activity updates, notifications, scheduled overdue-task processing, and Dockerized PostgreSQL infrastructure.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Socket.IO Client

### Backend
- Node.js
- Express
- TypeScript
- JWT Authentication
- Socket.IO
- Zod
- node-cron

### Database
- PostgreSQL
- Prisma ORM

### Infrastructure
- Docker
- Docker Compose
- Nginx

---

# Features

## Authentication

- JWT access tokens
- Refresh tokens
- Refresh token stored in HttpOnly cookie
- Password hashing with bcrypt
- Login, logout and token refresh
- Current-user authentication endpoint

## Role-Based Access Control

### Admin

- Full access to projects and tasks
- Global activity feed
- Dashboard statistics
- Online user count
- Manage projects and tasks

### Project Manager

- Create and manage own projects
- Create and manage tasks within authorized projects
- Assign tasks to developers
- View activity for owned projects
- Receive notifications when tasks move to In Review

### Developer

- View only assigned tasks
- Update status of assigned tasks
- Cannot access other developers' tasks

Authorization is enforced at the API level rather than relying only on frontend visibility.

---

# Task Management

Tasks support:

- Title
- Description
- Assigned developer
- Status
- Priority
- Due date
- Project relationship
- Activity history

### Task Status

- To Do
- In Progress
- In Review
- Done
- Overdue

### Priority

- Low
- Medium
- High
- Critical

Task filtering supports:

- Status
- Priority
- Due-date range

Filters are represented through query parameters so filtered URLs can be shared.

---

# Real-Time Activity Feed

The application uses Socket.IO for real-time communication.

Whenever a task status changes:

1. The API verifies authorization.
2. The task status is updated.
3. An activity log is created.
4. Relevant users receive the activity through Socket.IO.
5. The activity appears without refreshing the page.

Activity visibility is role-aware:

- Admin → global activity
- Project Manager → activity from owned projects
- Developer → activity for assigned tasks

---

# Offline Catch-Up

Real-time events are not stored only in memory.

When a user reconnects, the frontend requests recent authorized activity events from PostgreSQL.

The activity API returns the latest 20 events that the user is authorized to view.

This allows users to catch up on activity that occurred while they were offline.

---

# Notifications

Notifications are stored in PostgreSQL.

Examples:

- Developer receives a notification when assigned a task.
- Project Manager receives a notification when a task moves to In Review.

Features include:

- Unread notification count
- Notification dropdown
- Mark individual notification as read
- Mark all notifications as read
- Real-time notification updates through Socket.IO

No polling is used for unread notification updates.

---

# Background Jobs

The application uses `node-cron`.

A scheduled job runs every minute and checks for tasks whose due date has passed.

Overdue processing:

1. Finds unfinished tasks past their due date.
2. Changes their status to `OVERDUE`.
3. Creates an activity log.
4. Emits a real-time activity event.

The overdue check is performed by the background job rather than during page loading.

---

# Database Design

Main entities:

```text
User
  │
  ├── Project
  ├── Task
  ├── ActivityLog
  ├── Notification
  └── RefreshToken

Client
  │
  └── Project
       │
       └── Task
            │
            └── ActivityLog
