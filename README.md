# Store Rating Platform

A full-stack web application where users can rate registered stores on a scale of 1–5. Built as part of an internship coding challenge.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS (TypeScript) |
| Database | PostgreSQL + TypeORM |
| Frontend | React + Vite (TypeScript) |
| Auth | JWT + Passport |

## User Roles

- **Admin** — manages users, stores, and views platform stats
- **Normal User** — browses stores, submits and edits ratings
- **Store Owner** — views their store's ratings and average score

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL running locally

### 1. Database Setup

```sql
CREATE DATABASE store_ratings;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm install
npm run start:dev
```

The API runs at **http://localhost:3001/api**

**Default Admin Account** (auto-created on first run):
- Email: `admin@storeratings.com`
- Password: `Admin@123456`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**

## Form Validation Rules

| Field | Rule |
|-------|------|
| Name | 20–60 characters |
| Address | Max 400 characters |
| Password | 8–16 chars, must contain 1 uppercase + 1 special character |
| Email | Standard email format |
| Rating | Integer between 1 and 5 |

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| PATCH | /api/auth/change-password | All logged-in users |
| GET | /api/users | Admin |
| POST | /api/users | Admin |
| GET | /api/users/:id | Admin |
| GET | /api/stores | All logged-in users |
| POST | /api/stores | Admin |
| POST | /api/ratings | Normal User |
| PATCH | /api/ratings/:id | Normal User (own ratings) |
| GET | /api/ratings/owner/dashboard | Store Owner |
| GET | /api/dashboard/admin | Admin |

## Project Structure

```
internship/
├── backend/          # NestJS API
│   └── src/
│       ├── auth/         # Login, register, JWT
│       ├── users/        # User CRUD + admin tools
│       ├── stores/       # Store management
│       ├── ratings/      # Rating submit/update
│       ├── dashboard/    # Stats aggregation
│       └── common/       # Guards, decorators, enums
└── frontend/         # React + Vite
    └── src/
        ├── pages/        # Route-level page components
        ├── components/   # Reusable UI components
        ├── contexts/     # Auth state (React Context)
        ├── services/     # Axios API client
        └── styles/       # Global CSS
```
