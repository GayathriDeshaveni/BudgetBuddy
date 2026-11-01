# Import Django REST Framework generic views
from rest_framework import generics
from django.db.models import Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

# Import permission class to allow only authenticated users
from rest_framework.permissions import IsAuthenticated

# Import serializers for Expense, Income, and Budget models
from .serializers import (
    ExpenseSerializer,
    IncomeSerializer,
    BudgetSerializer,
    SavingsGoalSerializer,
)

# Import Expense, Income, and Budget models
from .models import Expense, Income, Budget, SavingsGoal


# 1. EXPENSE API: Handles listing and creating expenses
class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    # Retrieve only expenses belonging to the logged-in user
    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    # Automatically assign the logged-in user when creating an expense
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# 2. EXPENSE DETAIL API: Handles retrieving, updating, and deleting an expense
class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    # Allow access only to the logged-in user's expenses
    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)


# 3. INCOME API: Handles listing and creating income records
class IncomeListCreateView(generics.ListCreateAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    # Retrieve only income records belonging to the logged-in user
    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    # Automatically assign the logged-in user when creating an income record
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# 4. INCOME DETAIL API: Handles retrieving, updating, and deleting an income record
class IncomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    # Allow access only to the logged-in user's income records
    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)


# 5. BUDGET API: Handles listing and creating budgets
# 5. BUDGET API: Handles listing and creating budgets
class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    # Retrieve only budgets belonging to the logged-in user
    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    # Create a new budget or update an existing one
    def perform_create(self, serializer):
        category = serializer.validated_data["category"]
        month = serializer.validated_data["month"]
        year = serializer.validated_data["year"]
        limit_amount = serializer.validated_data["limit_amount"]

        existing_budgets = Budget.objects.filter(
            user=self.request.user,
            category=category,
            month=month,
            year=year
        ).order_by("id")

        if existing_budgets.exists():
            budget = existing_budgets.first()

            # Update the existing budget limit
            budget.limit_amount = limit_amount
            budget.save()

            # Remove any duplicate records
            existing_budgets.exclude(id=budget.id).delete()

            serializer.instance = budget
        else:
            serializer.save(user=self.request.user)

# 6. BUDGET DETAIL API: Handles retrieving, updating, and deleting a budget
class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    # Allow access only to the logged-in user's budgets
    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)
# 7. BUDGET SUMMARY API: Calculates monthly spending against budget limits
class BudgetSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the current month and year
        today = timezone.localdate()
        current_month = today.month
        current_year = today.year

        # Retrieve budgets belonging to the logged-in user
        budgets = Budget.objects.filter(
            user=request.user,
            month=current_month,
            year=current_year
        )

        summary = []

        # Calculate spending for each budget category
        for budget in budgets:
            total_spent = Expense.objects.filter(
                user=request.user,
                category__iexact=budget.category,
                date__month=current_month,
                date__year=current_year
            ).aggregate(total=Sum("amount"))["total"] or 0

            # Calculate the remaining budget
            remaining = budget.limit_amount - total_spent

            # Calculate the percentage of budget used
            percentage_used = (
                (total_spent / budget.limit_amount) * 100
                if budget.limit_amount > 0 else 0
            )

            # Add the calculated details to the response
            summary.append({
                "category": budget.category,
                "budget_limit": budget.limit_amount,
                "total_spent": total_spent,
                "remaining": remaining,
                "percentage_used": round(percentage_used, 2),
                "is_exceeded": total_spent > budget.limit_amount
            })

        return Response(summary)
# List, create, and manage savings goals
class SavingsGoalListCreateView(generics.ListCreateAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Retrieve, update, and delete a savings goal
class SavingsGoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)