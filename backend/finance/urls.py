# Import Django's path function for URL routing
from django.urls import path


# Import Expense and Income API views
from .views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    FinancialAnalyticsView,
    IncomeListCreateView,
    IncomeDetailView,
    BudgetListCreateView,
    BudgetDetailView,
    BudgetSummaryView,
    SavingsGoalListCreateView,
    SavingsGoalDetailView,
    NotificationListCreateView,
    NotificationDetailView,
    ReportListCreateView,
    ReportDetailView,
    ReportPDFView,
    ReportExcelView,
    ProfileView,

)


urlpatterns = [
    # Expense API routes
    path(
        "expenses/",
        ExpenseListCreateView.as_view(),
        name="expense-list-create",
    ),
    path(
        "expenses/<int:pk>/",
        ExpenseDetailView.as_view(),
        name="expense-detail",
    ),

    # Income API routes
    path(
        "incomes/",
        IncomeListCreateView.as_view(),
        name="income-list-create",
    ),
    path(
        "incomes/<int:pk>/",
        IncomeDetailView.as_view(),
        name="income-detail",
    ),
    path(
    "budgets/",
    BudgetListCreateView.as_view(),
    name="budget-list-create",
),
path(
    "budgets/<int:pk>/",
    BudgetDetailView.as_view(),
    name="budget-detail",
),
path(
    "budgets/summary/",
    BudgetSummaryView.as_view(),
    name="budget-summary",
),
path(
    "savings-goals/",
    SavingsGoalListCreateView.as_view(),
    name="savings-goal-list-create",
),
path(
    "savings-goals/<int:pk>/",
    SavingsGoalDetailView.as_view(),
    name="savings-goal-detail",
),
path('notifications/', NotificationListCreateView.as_view(), name='notification-list-create'),
path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
path(
    "analytics/",
    FinancialAnalyticsView.as_view(),
    name="financial-analytics",
),
# Financial Report API routes
path(
    "reports/",
    ReportListCreateView.as_view(),
    name="report-list-create",
),
path(
    "reports/<int:pk>/",
    ReportDetailView.as_view(),
    name="report-detail",
),
path(
    "reports/<int:pk>/pdf/",
    ReportPDFView.as_view(),
    name="report-pdf",
),
path(
    "reports/<int:pk>/excel/",
    ReportExcelView.as_view(),
    name="report-excel"
),
    path("profile/", ProfileView.as_view(), name="profile"),
]