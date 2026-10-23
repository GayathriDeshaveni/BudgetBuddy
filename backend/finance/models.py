
# Import Django settings to access our custom User model
from django.conf import settings

# Import Django's database model tools
from django.db import models


# 1. PROFILE: Stores extra information about a user
class Profile(models.Model):
    # Each user has one profile
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    # User's monthly income (default is zero)
    monthly_income = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )

    # Default currency is Indian Rupees
    currency = models.CharField(max_length=3, default="INR")

    def __str__(self):
        return f"Profile: {self.user.username}"


# 2. INCOME: Stores money received by a user
class Income(models.Model):
    # Connect this income record to its owner
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="incomes",
    )

    # Where the money came from, e.g. Salary
    source = models.CharField(max_length=100)

    # Amount of money received
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    # Date the money was received
    date = models.DateField()

    # Optional additional details
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.source}: {self.amount}"


# 3. EXPENSE: Stores money spent by a user
class Expense(models.Model):
    # Connect this expense to its owner
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="expenses",
    )

    # Name of the expense, e.g. Groceries
    title = models.CharField(max_length=100)

    # Expense category, e.g. Food or Travel
    category = models.CharField(max_length=50)

    # Amount spent
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    # Date the expense happened
    date = models.DateField()

    # Optional additional details
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title}: {self.amount}"


# 4. BUDGET: Sets a spending limit for a category
class Budget(models.Model):
    # Connect the budget to its owner
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="budgets",
    )

    # Category for this budget, e.g. Food
    category = models.CharField(max_length=50)

    # Maximum amount allowed for this category
    limit_amount = models.DecimalField(
        max_digits=12, decimal_places=2
    )

    # Month and year of the budget
    month = models.PositiveSmallIntegerField()
    year = models.PositiveSmallIntegerField()

    def __str__(self):
        return f"{self.category} budget: {self.limit_amount}"


# 5. SAVINGS GOAL: Tracks a user's savings target
class SavingsGoal(models.Model):
    # Connect the savings goal to its owner
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="savings_goals",
    )

    # Name of the goal, e.g. Buy a laptop
    title = models.CharField(max_length=100)

    # Total amount the user wants to save
    target_amount = models.DecimalField(
        max_digits=12, decimal_places=2
    )

    # Amount already saved (default is zero)
    current_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )

    # Optional deadline for reaching the goal
    target_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.title


# 6. NOTIFICATION: Stores messages for a user
class Notification(models.Model):
    # Connect the notification to its owner
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    # Notification message
    message = models.CharField(max_length=255)

    # False means unread; True means read
    is_read = models.BooleanField(default=False)

    # Automatically save the creation date and time
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message


# 7. REPORT: Stores information about a financial report
class Report(models.Model):
    # Connect the report to its owner
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reports",
    )

    # Report name, e.g. Monthly Expense Report
    title = models.CharField(max_length=100)

    # Start and end dates covered by the report
    start_date = models.DateField()
    end_date = models.DateField()

    # Automatically record when the report was created
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
