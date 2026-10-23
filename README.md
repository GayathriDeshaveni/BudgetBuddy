
# BudgetBuddy

## Project Overview
BudgetBuddy is a full-stack personal budget planning and expense management platform. It aims to help students manage their income, track expenses, plan budgets, and monitor savings goals.

## Technologies Used
- Frontend: React.js, JavaScript, Axios
- Backend: Python, Django, Django REST Framework
- Database: SQLite
- Authentication: JWT using SimpleJWT
- Development tools: VS Code, PowerShell

## Main Modules
- User Authentication and Role Management
- User Profile Management
- Income Management
- Expense Tracking
- Budget Planning
- Savings Goal Management
- Notifications and Reports

## Current Progress
- Configured the Django backend and SQLite database.
- Created a custom user model with Student, Premium User, and Admin roles.
- Implemented registration and JWT login/token refresh endpoints.
- Created Profile, Income, Expense, Budget, SavingsGoal, Notification, and Report models.
- Created a React login and registration interface with a basic dashboard.
- Tested protected API access using JWT authentication.
- Registered the finance models in Django Admin.

## Project Structure
```text
BudgetBuddy/
├── backend/
│   ├── accounts/
│   ├── config/
│   ├── finance/
│   ├── manage.py
│   └── db.sqlite3
├── frontend/
│   ├── src/
│   ├── package.json
│   └── index.html
└── README.md
```

## How to Run the Backend

Open a terminal in the backend folder:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver
```

Backend URL: http://127.0.0.1:8000/

## How to Run the Frontend

Open a separate terminal in the frontend folder:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173/

## Authentication Endpoints

- POST `/api/auth/register/` — Register a user
- POST `/api/auth/login/` — Obtain JWT access and refresh tokens
- POST `/api/auth/token/refresh/` — Refresh an access token
- GET `/api/auth/protected-test/` — Test authenticated API access

## Database
SQLite is used for local development. The database schema includes user profiles, incomes, expenses, budgets, savings goals, notifications, and reports.

## Development Status
Milestone 1 focuses on requirements, database design, backend setup, JWT authentication, and the React frontend skeleton. Financial management functionality and other advanced features are planned for later milestones.
