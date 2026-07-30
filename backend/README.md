# Grievance Redressal & Maintenance Tracker — Backend

Flask + SQLite backend for the Campus Grievance Tracker (Track 3, Problem #3).

## Setup

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate it
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
python app.py
```

Server runs at: `http://localhost:5000`
Health check: `GET http://localhost:5000/api/health`

## Environment Variables

Copy `.env.example` to `.env` and adjust values if needed. A working `.env` with
dev defaults is already included for hackathon convenience — change the secrets
before any real deployment.

## API Overview

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/register` | Register user (student/admin/superadmin) |
| POST | `/api/login` | Login, returns JWT access_token |

### Issues (require `Authorization: Bearer <token>` header)
| Method | Route | Description |
|---|---|---|
| POST | `/api/issues` | Create issue (JSON or multipart with `attachment`) |
| GET | `/api/issues` | List issues (own for student, all for admin). Filters: `?status=` `?category=` |
| GET | `/api/issues/<id>` | Issue detail + status log history |
| PUT | `/api/issues/<id>/status` | Update status (admin/assigned staff only) |

### Admin only
| Method | Route | Description |
|---|---|---|
| PUT | `/api/issues/<id>/assign` | Assign issue to a staff member |
| GET | `/api/issues/escalated` | List all overdue/escalated issues |
| GET | `/api/staff` | List all admin/superadmin users |
| GET | `/api/stats` | Dashboard counts (status + category breakdown) |

## Sample: Register + Login

```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aman","email":"aman@vitbhopal.ac.in","password":"test123","role":"student"}'

curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aman@vitbhopal.ac.in","password":"test123"}'
```

Copy the `access_token` from the login response and use it as:
`Authorization: Bearer <access_token>` in subsequent requests.

## Sample: Create an Issue

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Fan not working","description":"Hostel A room 204 fan broken","category":"electrical"}'
```

## SLA / Auto-Escalation

Every `GET /api/issues`, `/api/issues/<id>`, `/api/issues/escalated`, and
`/api/stats` call automatically scans for overdue issues and flips their status
to `escalated`. `SLA_HOURS` (default 24) controls the deadline window, set per
issue at creation time.

## Folder Structure

```
backend/
├── app.py
├── config.py
├── models/        # User, Issue, StatusLog
├── routes/        # auth, issues, admin blueprints
├── utils/         # auth decorator, file upload, SLA checker
├── static/uploads/
└── database/app.db (auto-created on first run)
```
