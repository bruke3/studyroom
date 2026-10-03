# 📚 StudyRoom

> A minimal full-stack study planner with real-time study rooms.

StudyRoom is a simple full-stack web application that combines a personal task planner with a real-time study room.

Users can create and manage study tasks, then join a shared study room where they can see who is currently connected and receive real-time join/leave activity.

The project was intentionally built as a **minimal MVP** to demonstrate the fundamentals of full-stack development without unnecessary complexity.

---

# ✨ Features

## 📋 Task Management

* Create study tasks
* View saved tasks
* Mark tasks as completed or incomplete
* Delete tasks
* Tasks persist in PostgreSQL

## 🟢 Real-Time Study Room

* Join a study room with a username
* See currently connected users
* Receive real-time join notifications
* Receive real-time leave notifications
* See a live activity feed
* Supports multiple connected browsers

---

# 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* React
* Vite

### Backend

* Node.js
* Express
* WebSocket (`ws`)

### Database

* PostgreSQL

### Development Tools

* npm
* Git

---

# 🏗️ Architecture

StudyRoom uses two communication systems:

### REST API

Used for persistent task operations.

```text
React
  │
  │ HTTP requests
  ▼
Express API
  │
  │ SQL
  ▼
PostgreSQL
```

### WebSockets

Used for real-time study room activity.

```text
Browser A ──┐
            │
Browser B ──┼── WebSocket Server
            │
Browser C ──┘
```

The frontend communicates with the backend through both systems depending on what it needs to do.

---

# 📁 Project Structure

```text
studyroom/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── package-lock.json
│
└── server/
    ├── routes/
    │   └── tasks.js
    │
    ├── db.js
    ├── server.js
    ├── .env
    ├── .gitignore
    ├── package.json
    └── package-lock.json
```

---

# 🗄️ Database

StudyRoom uses PostgreSQL with a single table for the MVP.

## `tasks`

| Column       | Type         | Description       |
| ------------ | ------------ | ----------------- |
| `id`         | SERIAL       | Unique task ID    |
| `title`      | VARCHAR(255) | Task title        |
| `completed`  | BOOLEAN      | Completion status |
| `created_at` | TIMESTAMP    | Creation time     |

The database is intentionally simple because the MVP does not require users, authentication, or additional relationships.

## Create the database

```sql
CREATE DATABASE studyroom;
```

Then connect to the `studyroom` database and create the table:

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 🔌 REST API

The backend runs on:

```text
http://localhost:5000
```

## Get all tasks

```http
GET /api/tasks
```

Returns all tasks ordered by creation time.

---

## Create a task

```http
POST /api/tasks
```

Request body:

```json
{
  "title": "Study React"
}
```

---

## Toggle a task

```http
PATCH /api/tasks/:id
```

Toggles the task between completed and incomplete.

Example:

```http
PATCH /api/tasks/1
```

---

## Delete a task

```http
DELETE /api/tasks/:id
```

Example:

```http
DELETE /api/tasks/1
```

---

# 🔌 WebSocket System

The WebSocket server runs on:

```text
ws://localhost:5000
```

The same Node.js server handles both the Express API and WebSocket connections.

## Joining

When a user joins the room, the frontend sends:

```json
{
  "type": "join",
  "name": "Bruke"
}
```

The server:

1. Stores the user's WebSocket connection and name.
2. Sends the current list of connected users to the new user.
3. Broadcasts a `user_joined` event to connected clients.

Example:

```json
{
  "type": "user_joined",
  "name": "Bruke"
}
```

## Leaving

When a WebSocket connection closes, the server removes the user and broadcasts:

```json
{
  "type": "user_left",
  "name": "Bruke"
}
```

This allows the other connected users to update their room in real time.

---

# ⚙️ Environment Variables

Create a `.env` file inside the `server` directory:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=studyroom
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_PORT=5432
```

Replace:

```text
YOUR_POSTGRES_PASSWORD
```

with your local PostgreSQL password.

**Never commit `.env` to Git.**

The server `.gitignore` should contain:

```text
node_modules
.env
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* PostgreSQL

---

## 1. Clone the project

```bash
git clone <repository-url>
cd studyroom
```

---

## 2. Set up PostgreSQL

Create the database:

```sql
CREATE DATABASE studyroom;
```

Create the `tasks` table using the SQL shown in the Database section.

---

## 3. Configure the backend

Open the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create your `.env` file and add your PostgreSQL credentials.

---

## 4. Start the backend

From the `server` directory:

```bash
npm run dev
```

The backend should start at:

```text
http://localhost:5000
```

---

## 5. Start the frontend

Open another terminal.

From the project root:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

The frontend should be available at:

```text
http://localhost:5173
```

---

# 🧪 Testing the Application

## Test Tasks

1. Open StudyRoom.
2. Create a task.
3. Mark it complete.
4. Mark it incomplete.
5. Delete it.
6. Refresh the page.
7. Create another task and refresh again.

Tasks should remain stored because they are saved in PostgreSQL.

---

## Test the Study Room

Open StudyRoom in two different browsers.

For example:

**Browser 1**

```text
Name: Bruke
```

**Browser 2**

```text
Name: Samuel
```

After joining, both browsers should be able to see the connected users.

You should also see real-time activity such as:

```text
🟢 Bruke joined the room
🟢 Samuel joined the room
```

Then click **Leave Room** in one browser.

The remaining browser should receive:

```text
🟢 Samuel left the room
```

---

# 🔄 How the Application Works

A typical task request looks like this:

```text
User
 │
 ▼
React
 │
 │ POST /api/tasks
 ▼
Express
 │
 │ INSERT
 ▼
PostgreSQL
 │
 │ task
 ▼
Express
 │
 ▼
React
 │
 ▼
Updated UI
```

A real-time room event works differently:

```text
User joins
    │
    ▼
React
    │
    │ WebSocket
    ▼
Node.js WebSocket Server
    │
    │ broadcast
    ├──────────────► Browser A
    │
    ├──────────────► Browser B
    │
    └──────────────► Browser C
```

This separation is one of the main concepts demonstrated by the project:

**REST is used for persistent application data, while WebSockets are used for real-time communication.**

---

# 🎯 Project Goals

StudyRoom was designed to practice the fundamentals of full-stack development:

* Building a React frontend
* Creating REST APIs
* Connecting Node.js to PostgreSQL
* Performing CRUD operations
* Managing frontend state
* Working with asynchronous requests
* Using WebSockets
* Broadcasting real-time events
* Connecting multiple clients to the same server
* Organizing a small full-stack project

The goal was not to build a large production platform.

The goal was to build a **small, complete system from frontend to database to real-time communication.**

---

# 🚧 Future Improvements

The following features are intentionally **outside the MVP** but could be added later:

* User authentication
* Multiple study rooms
* Persistent user accounts
* Real-time task synchronization
* Real-time chat
* Study timers
* Room invitations
* Online/offline status
* Better error handling
* Input validation
* Deployment
* Automated tests

These are potential future improvements, not requirements for the current version.

---

# 📌 MVP Scope

The current version intentionally focuses on:

```text
Task CRUD
      +
PostgreSQL
      +
REST API
      +
WebSockets
      +
Real-Time Study Room
```

Everything else was left out to keep the project small, understandable, and fast to complete.

---

# 👨‍💻 Built With

**Frontend:** React + Vite
**Backend:** Node.js + Express
**Database:** PostgreSQL
**Real-time:** WebSocket (`ws`)

---

# 📄 License

This project is currently a personal learning/MVP project.
