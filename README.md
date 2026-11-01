# BudgetBuddy AI Tool

## Project Overview

BudgetBuddy is a full-stack personal budget planning and expense management platform designed to help students manage income, track expenses, plan budgets, and monitor savings goals.

## Technologies Used

- **Frontend:** React.js, JavaScript, Axios, Vite
- **Backend:** Python, Django, Django REST Framework
- **Database:** SQLite
- **Authentication:** JWT using SimpleJWT
- **Development Tools:** Visual Studio Code, PowerShell, Git, GitHub.

## Main Modules

- User Authentication and Role Management
- User Profile Management
- Income Management
- Expense Tracking and Categorization
- Budget Planning and Tracking
- Savings Goal Management
- Dashboard and Financial Analytics
- Notifications and Reports

## Current Progress

### Milestone 1 – Project Setup and Authentication

- Configured the Django backend and SQLite database.
- Created a custom user model with Student, Premium User, and Admin roles.
- Implemented user registration, JWT login, and token refresh endpoints.
- Created Profile, Income, Expense, Budget, SavingsGoal, Notification, and Report models.
- Created the React login and registration interface.
- Tested protected API access using JWT authentication.
- Registered finance models in Django Admin.

### Milestone 2 – Financial Management

- Implemented income management APIs.
- Implemented expense tracking and CRUD operations.
- Implemented budget creation, updating, deletion, and listing.
- Added monthly budget summary functionality.
- Implemented savings goal management.
- Connected the React frontend with backend APIs.
- Developed the financial dashboard with income, expenses, and balance summaries.
- Added transaction history with search, filters, and pagination.
- Added expense breakdown and income-versus-expense analytics.
- Developed budget and savings goal interfaces.

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

Open a terminal in the repository root and run:

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

## Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a user |
| POST | `/api/auth/login/` | Obtain JWT access and refresh tokens |
| POST | `/api/auth/token/refresh/` | Refresh an access token |
| GET | `/api/auth/protected-test/` | Test authenticated API access |

## Database

SQLite is used for local development. The database includes models for user profiles, income, expenses, budgets, savings goals, notifications, and reports.

The local database file is not included in the repository.

## Development Status

**Completed:**
- Initial project setup and authentication.
- Database models and migrations.
- Income and expense management.
- Budget planning and monthly budget summaries.
- Savings goal management.
- Financial dashboard and transaction history.
- Basic financial analytics and frontend integration.

**Upcoming – Milestone 3:**
- Notification system.
- Budget alerts and overspending notifications.
- Financial analytics APIs.
- Monthly financial reports and report generation.

**Upcoming – Milestone 4:**
- Analytics dashboard enhancements.
- Testing and bug fixing.
- Application deployment.
- Production configuration and security improvements.

## Security

- Never commit `.env` files containing secrets or credentials.
- Do not commit local database files, virtual environments, or `node_modules`.
- Keep sensitive configuration out of source control.
