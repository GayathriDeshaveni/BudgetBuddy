# Import Django's path function for URL routing
from django.urls import path

# Import Expense and Income API views
from .views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    IncomeListCreateView,
    IncomeDetailView,
    BudgetListCreateView,
    BudgetDetailView,
    BudgetSummaryView,
    SavingsGoalListCreateView,
    SavingsGoalDetailView,
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
]