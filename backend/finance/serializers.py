# Import Django REST Framework's serializer tools

from rest_framework import serializers

# Import Expense, Income, and Budget models
from .models import Expense, Income, Budget, SavingsGoal, Notification, Report, Profile

# Categories offered by the BudgetBuddy forms.
# If you add a new category to the frontend dropdowns, add it here too.
ALLOWED_CATEGORIES = [
    "Food",
    "Travel",
    "Shopping",
    "Education",
    "Entertainment",
    "Bills",
    "Health",
    "Other",
]


# Reusable validation helpers
# The frontend forms already block bad values, but the API must check them too,
# because requests can be sent without using the forms (Postman, scripts, etc.).
def check_greater_than_zero(value, message):
    if value <= 0:
        raise serializers.ValidationError(message)
    return value


def check_category(value):
    # Accept any letter case ("food") and store the standard name ("Food").
    for name in ALLOWED_CATEGORIES:
        if str(value).strip().lower() == name.lower():
            return name
    raise serializers.ValidationError(
        "Category must be one of: " + ", ".join(ALLOWED_CATEGORIES) + "."
    )


# Expense Serializer
# Converts Expense model data into JSON and validates incoming expense data.
class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ["id", "title", "category", "amount", "date", "notes"]
        read_only_fields = ["id"]

    def validate_amount(self, value):
        return check_greater_than_zero(value, "Amount must be greater than zero.")

    def validate_category(self, value):
        return check_category(value)


# Income Serializer
# Converts Income model data into JSON and validates incoming income data.
# The user field is assigned automatically to the logged-in user in the view.
class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ["id", "source", "amount", "date", "notes"]
        read_only_fields = ["id"]

    def validate_amount(self, value):
        return check_greater_than_zero(value, "Amount must be greater than zero.")


# Budget Serializer
# Converts Budget model data into JSON and validates incoming budget data.
# The user field is assigned automatically to the logged-in user in the view.
class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ["id", "category", "limit_amount", "month", "year"]
        read_only_fields = ["id"]

    def validate_limit_amount(self, value):
        return check_greater_than_zero(
            value, "Budget limit must be greater than zero."
        )

    def validate_category(self, value):
        return check_category(value)

    def validate_month(self, value):
        if value < 1 or value > 12:
            raise serializers.ValidationError("Month must be between 1 and 12.")
        return value

    def validate_year(self, value):
        if value < 2020 or value > 2100:
            raise serializers.ValidationError("Year must be between 2020 and 2100.")
        return value


class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = [
            "id",
            "title",
            "target_amount",
            "current_amount",
            "target_date",
        ]
        read_only_fields = ["id"]

    def validate_target_amount(self, value):
        return check_greater_than_zero(
            value, "Target amount must be greater than zero."
        )

    def validate_current_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Saved amount cannot be negative.")
        return value


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            "id",
            "title",
            "start_date",
            "end_date",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]



# Profile Serializer
# Username, email and role are shown but cannot be changed here.
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    role = serializers.CharField(source="user.get_role_display", read_only=True)
    member_since = serializers.DateTimeField(source="user.date_joined", read_only=True)

    class Meta:
        model = Profile
        fields = ["username", "email", "role", "member_since", "monthly_income", "email_alerts"]

    def validate_monthly_income(self, value):
        if value < 0:
            raise serializers.ValidationError("Monthly income cannot be negative.")
        return value
