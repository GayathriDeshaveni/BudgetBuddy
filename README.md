# BudgetBuddy AI Tool

## Project Overview

BudgetBuddy is a full-stack personal budget planning and expense management platform designed to help students manage income, track expenses, plan budgets, and monitor savings goals.

## Technologies Used

- **Frontend:** React.js, JavaScript, Axios, Vite
- **Backend:** Python, Django, Django REST Framework
- **Database:** SQLite
- **Authentication:** JWT using SimpleJWT
- **Notifications:** In-app notifications, browser desktop alerts, and email alerts using Django email (SMTP)
- **Reports:** ReportLab (PDF) and OpenPyXL (Excel)
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

### Milestone 3 – Savings Goals, Notifications and Analytics

- Completed savings goal management: create goals with a target amount and optional target date, update saved progress, delete goals, and track progress with progress bars.
- Added savings goal milestone notifications at 25%, 50%, 75%, and 100%, plus reminders for goals that are due within 7 days or overdue.
- Built the notification system with APIs to list, mark as read, and delete notifications.
- Added a notification bell with an unread count, in-app pop-up alerts, optional browser desktop alerts, and a Notifications page with All, Unread, and Read filters and a "Mark all as read" option.
- Added budget alerts when a category reaches or exceeds its monthly limit. Alerts appear in the app and are also sent by email: one email when the limit is reached and one when the budget is exceeded, per category per month.
- Added a monthly report reminder during the first week of each month.
- Added a financial analytics API (`/api/analytics/`) returning monthly income, expenses, balance, and category-wise expenses.
- Added a dedicated Analytics page with expense breakdown by category, income versus expenses, income by source, monthly cash flow (3, 6, 12 months, or all time), and savings progress.
- Implemented report generation for any date range, with a transaction preview and export to PDF and Excel.
- Redesigned the Overview page as a quick summary: totals, recent transactions, budget snapshot, savings goals snapshot, and latest alerts. Over-budget categories are shown in red.
- Improved the layout to use the full screen width and made status messages dismiss automatically.

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

## Environment Configuration

Create a `backend/.env` file (it is ignored by Git) with the following values. Replace the placeholders with your own details:

```text
DJANGO_SECRET_KEY=your-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

Budget alert emails are sent to the email address registered by the user. For Gmail, use an app password, not your normal account password.

## Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a user |
| POST | `/api/auth/login/` | Obtain JWT access and refresh tokens |
| POST | `/api/auth/token/refresh/` | Refresh an access token |
| GET | `/api/auth/protected-test/` | Test authenticated API access |

## Finance API Endpoints

All finance endpoints require a valid JWT access token and return only the logged-in user's data.

| Endpoint | Methods | Description |
|---|---|---|
| `/api/expenses/` and `/api/expenses/<id>/` | GET, POST / GET, PUT, PATCH, DELETE | Manage expenses |
| `/api/incomes/` and `/api/incomes/<id>/` | GET, POST / GET, PUT, PATCH, DELETE | Manage income records |
| `/api/budgets/` and `/api/budgets/<id>/` | GET, POST / GET, PUT, PATCH, DELETE | Manage monthly budgets |
| `/api/budgets/summary/` | GET | Monthly budget usage; creates budget alerts and sends alert emails |
| `/api/savings-goals/` and `/api/savings-goals/<id>/` | GET, POST / GET, PUT, PATCH, DELETE | Manage savings goals and milestone notifications |
| `/api/notifications/` and `/api/notifications/<id>/` | GET, POST / GET, PATCH, DELETE | List, read, and delete notifications |
| `/api/analytics/` | GET | Monthly income, expenses, balance, and category totals |
| `/api/reports/` and `/api/reports/<id>/` | GET, POST / GET, DELETE | Create, list, and delete financial reports |
| `/api/reports/<id>/pdf/` | GET | Download a report as PDF |
| `/api/reports/<id>/excel/` | GET | Download a report as Excel |

## Database

SQLite is used for local development. The database includes models for user profiles, income, expenses, budgets, savings goals, notifications, and reports.

The local database file is not included in the repository.

## Development Status

**Completed:**
- Initial project setup and authentication.
- Database models and migrations.
- Income and expense management.
- Budget planning and monthly budget summaries.
- Savings goal management with milestone notifications and reminders.
- Financial dashboard and transaction history.
- Notification system with in-app, desktop, and email budget alerts.
- Analytics page and financial analytics API.
- Financial report generation with PDF and Excel export.

**Upcoming – Milestone 4:**
- Testing and bug fixing.
- Profile management and role-based features (Admin and Premium).
- Automatic token refresh and optional OAuth2 login.
- Analytics dashboard enhancements.
- Application deployment with PostgreSQL.
- Production configuration and security improvements.

## Security

- Never commit `.env` files containing secrets or credentials.
- Do not commit local database files, virtual environments, or `node_modules`.
- Keep sensitive configuration out of source control.