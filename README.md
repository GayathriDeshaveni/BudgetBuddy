# BudgetBuddy AI Tool

## Project Overview

BudgetBuddy is a full-stack personal budget planning and expense management platform. It aims to help students manage their income, track expenses, plan budgets, and monitor savings goals.

## Technologies Used

- **Frontend:** React.js, JavaScript, Axios, Vite
- **Backend:** Python, Django, Django REST Framework
- **Database:** SQLite
- **Authentication:** JWT using SimpleJWT
- **Development Tools:** Visual Studio Code, PowerShell, Git, GitHub

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
- Implemented registration, JWT login, and token refresh endpoints.
- Created Profile, Income, Expense, Budget, SavingsGoal, Notification, and Report models.
- Created a React login and registration interface with a basic dashboard.
- Tested protected API access using JWT authentication.
- Registered finance models in Django Admin.

## Project Structure

```text
BudgetBuddy-AI-Tool/
├── backend/
│   ├── accounts/
│   ├── config/
│   ├── finance/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── vite.config.js
├── .gitignore
└── README.md
```

## How to Run the Backend

Open a terminal in the repository root and run these commands one by one:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend URL: `http://127.0.0.1:8000/`

## How to Run the Frontend

Open a separate terminal in the repository root and run:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173/`

## Authentication Endpoint

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a user |
| POST | `/api/auth/login/` | Obtain JWT access and refresh tokens |
| POST | `/api/auth/token/refresh/` | Refresh an access token |
| GET | `/api/auth/protected-test/` | Test authenticated API access |

## Database

SQLite is used for local development. The database models include user profiles, income, expenses, budgets, savings goals, notifications, and reports.

The local database file is not included in the repository.

## Development Status

**Completed:** Initial project setup, custom user model, database models and migrations, JWT authentication endpoints, and the basic React interface.

**Next steps:** Implement and test the finance APIs, connect the frontend to financial data, and develop income, expense, budget, savings goal, notification, and reporting functionality.

## Security

- Never commit `.env` files containing secrets or credentials.
- Do not commit local database files, virtual environments, or `node_modules`.
- Keep sensitive configuration out of source control.
