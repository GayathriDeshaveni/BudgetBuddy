from django.contrib import admin

# Register your models here.

from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class BudgetBuddyUserAdmin(UserAdmin):
    # Show the BudgetBuddy role in the user list and allow admins to change it.
    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    fieldsets = UserAdmin.fieldsets + (
        ("BudgetBuddy role", {"fields": ("role",)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("BudgetBuddy role", {"fields": ("role",)}),
    )