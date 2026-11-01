# Import Django REST Framework's serializer tools
from rest_framework import serializers

# Import Expense, Income, and Budget models
from .models import Expense, Income, Budget,SavingsGoal


# Expense Serializer
# Converts Expense model data into JSON and validates incoming expense data.
class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ["id", "title", "category", "amount", "date", "notes"]
        read_only_fields = ["id"]


# Income Serializer
# Converts Income model data into JSON and validates incoming income data.
# The user field is assigned automatically to the logged-in user in the view.
class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ["id", "source", "amount", "date", "notes"]
        read_only_fields = ["id"]


# Budget Serializer
# Converts Budget model data into JSON and validates incoming budget data.
# The user field is assigned automatically to the logged-in user in the view.
class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ["id", "category", "limit_amount", "month", "year"]
        read_only_fields = ["id"]
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