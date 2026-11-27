# BudgetBuddy AI Tool

## Project Overview

BudgetBuddy is a full-stack personal budget planning and expense management platform designed to help students manage income, track expenses, plan budgets, and monitor savings goals.

## Live Demo

- **Frontend (Vercel):** https://budget-buddy-nine-nu.vercel.app
- **Backend API (Render):** https://budgetbuddy-164q.onrender.com

The backend runs on a free Render instance, so the first request after a period of inactivity can take up to a minute while the server wakes up. On the free instance outbound SMTP is blocked, so budget alert emails are written to the server log instead of being sent; in-app and desktop alerts work normally. Email delivery works locally with Gmail SMTP.

## Technologies Used

- **Frontend:** React.js, JavaScript, Axios, Vite
- **Backend:** Python, Django, Django REST Framework
- **Database:** SQLite for local development, PostgreSQL in production
- **Authentication:** JWT using SimpleJWT, with automatic token refresh
- **Notifications:** In-app notifications, browser desktop alerts, and email alerts using Django email (SMTP)
- **Reports:** ReportLab (PDF) and OpenPyXL (Excel)
- **Testing:** Django test framework with Django REST Framework API tests
- **Deployment:** Render (backend and PostgreSQL database) and Vercel (frontend)
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

### Milestone 4 (in progress) – Core Improvements

- **Server-side validation:** the API now rejects zero or negative amounts, invalid budget months and years, invalid savings goal values, and unknown categories, so data stays correct even when requests bypass the forms.
- **Automatic token refresh:** expired access tokens are renewed silently using the refresh token. If the session cannot be renewed, the user is logged out with a clear message.
- **Profile management:** a Profile page with account details, an initials avatar, member-since date, monthly income, and an email alerts preference. Turning email alerts off stops budget alert emails, while in-app alerts continue.
- **Monthly Plan:** the Overview and Budgets pages compare the user's budgets with their monthly income and warn when budgets exceed it.
- **Change password:** logged-in users can change their password after confirming the current one. New passwords follow Django's password rules.
- **Premium feature:** PDF and Excel report export is available to Premium and Admin users only. The restriction is enforced by the backend, and Students see a locked button.
- **Role management:** users are registered as Students. An admin changes roles (Student, Premium User, Admin) in Django Admin.
- **Categories:** added the Entertainment category for expenses and budgets.
- **Income categories:** income records now have a category (Pocket Money, Scholarship, Freelance, Salary, Other), used in the Add Transaction form, the Transactions filter, and the Analytics "Income by category" card. A migration categorized the existing records automatically.
- **Deployment:** the backend and a PostgreSQL database run on Render, and the frontend runs on Vercel. All settings that differ between local and production (secret key, debug mode, allowed hosts, CORS, database, HTTPS, email backend and the API address) are read from environment variables.
- **Automated tests:** 34 backend tests cover savings goals, budget alert emails, notifications, analytics, reports, profile, Premium access, and password change.

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

To manage users and roles, create an admin account and open Django Admin at `http://127.0.0.1:8000/admin/`:

```powershell
python manage.py createsuperuser
```

## How to Run the Frontend

Open a separate terminal in the repository root and run:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173/`

## How to Run the Tests

In the `backend` folder, with the virtual environment active:

```powershell
python manage.py test
```

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

Optional production variables (all have safe defaults for local development):

| Variable | Purpose |
|---|---|
| `DJANGO_DEBUG` | `True` for local development, `False` in production |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated host names (the Render host is added automatically) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend addresses allowed to call the API |
| `CSRF_TRUSTED_ORIGINS` | Extra trusted origins for the admin site |
| `DATABASE_URL` | PostgreSQL connection string; when it is not set, SQLite is used |
| `DJANGO_USE_HTTPS` | `True` in production to enable HTTPS redirect and secure cookies |
| `EMAIL_BACKEND` | Set to `django.core.mail.backends.console.EmailBackend` where SMTP is blocked |

The frontend reads the API address from `VITE_API_URL` (for example `https://your-backend.onrender.com/api/`).

## Deployment

**Backend and database (Render):** create a PostgreSQL database, then a Python web service with the root directory `backend`.

- Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && (python manage.py createsuperuser --noinput || true)`
- Start command: `gunicorn config.wsgi:application`
- Environment variables: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `DATABASE_URL`, `DJANGO_USE_HTTPS=True`, `CORS_ALLOWED_ORIGINS`, `EMAIL_BACKEND`, and `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL`, `DJANGO_SUPERUSER_PASSWORD` for the first admin account.

**Frontend (Vercel):** import the repository with the root directory `frontend` (Vite) and set `VITE_API_URL` to the backend's `/api/` address.

Roles (Premium User, Admin) are assigned in Django Admin on the backend address under `/admin/`.

## User Roles

| Role | How it is assigned | Access |
|---|---|---|
| Student | Automatically when registering | All core features |
| Premium User | By an admin in Django Admin | Core features plus PDF and Excel report export |
| Admin | By a superuser in Django Admin | Premium features plus user management |

## Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a user |
| POST | `/api/auth/login/` | Obtain JWT access and refresh tokens |
| POST | `/api/auth/token/refresh/` | Refresh an access token |
| GET | `/api/auth/me/` | Current user's identity and role |
| POST | `/api/auth/change-password/` | Change the logged-in user's password |
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
| `/api/profile/` | GET, PATCH | View and update monthly income and email alert preference |
| `/api/reports/` and `/api/reports/<id>/` | GET, POST / GET, DELETE | Create, list, and delete financial reports |
| `/api/reports/<id>/pdf/` | GET | Download a report as PDF (Premium and Admin only) |
| `/api/reports/<id>/excel/` | GET | Download a report as Excel (Premium and Admin only) |

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
- Profile management, change password, and the monthly plan.
- Role-based Premium export and role management through Django Admin.
- Server-side validation, automatic token refresh, and 34 automated backend tests.
- Income categories, deployment on Render and Vercel with PostgreSQL, and environment-based production configuration.

**Upcoming – Milestone 4:**
- End-to-end workflow testing and bug fixing.

## Security

- Never commit `.env` files containing secrets or credentials.
- Do not commit local database files, virtual environments, or `node_modules`.
- Keep sensitive configuration out of source control.
- Role changes are available only to administrators; users cannot choose their own role.