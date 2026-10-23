
from django.contrib import admin
from .models import (
    Profile,
    Income,
    Expense,
    Budget,
    SavingsGoal,
    Notification,
    Report,
)

# Make financial models available in Django Admin
admin.site.register(Profile)
admin.site.register(Income)
admin.site.register(Expense)
admin.site.register(Budget)
admin.site.register(SavingsGoal)
admin.site.register(Notification)
admin.site.register(Report)
