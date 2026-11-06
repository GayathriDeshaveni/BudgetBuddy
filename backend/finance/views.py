# Import Django REST Framework generic views
from rest_framework import generics, permissions
from django.db.models import Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from io import BytesIO
from reportlab.lib.utils import simpleSplit
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
# Import permission class to allow only authenticated users
from rest_framework.permissions import IsAuthenticated
from openpyxl.utils import get_column_letter
from django.core.mail import send_mail
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)


def create_savings_goal_milestone_notifications(goal, previous_amount=0):
    """Create one in-app notification when a savings goal crosses a milestone."""
    target_amount = goal.target_amount
    if target_amount is None or target_amount <= 0:
        return

    previous_amount = previous_amount or 0
    current_amount = goal.current_amount or 0
    previous_progress = (previous_amount / target_amount) * 100
    current_progress = (current_amount / target_amount) * 100

    for milestone in (25, 50, 75, 100):
        if previous_progress < milestone <= current_progress:
            notification_prefix = (
                f"Savings goal milestone — {goal.title} ({milestone}%):"
            )

            # Keep each milestone notification unique for this goal title.
            already_notified = Notification.objects.filter(
                user=goal.user,
                message__startswith=notification_prefix,
            ).exists()

            if not already_notified:
                Notification.objects.create(
                    user=goal.user,
                    message=(
                        f"{notification_prefix} You have saved "
                        f"₹{current_amount:,.2f} of ₹{target_amount:,.2f}. "
                        f"Congratulations on reaching {milestone}% of your goal!"
                    ),
                )


def create_savings_goal_reminders(user):
    """Create one upcoming and, when needed, one overdue reminder per goal date.

    Reminders are generated when the authenticated app requests notifications.
    They are in-app notifications; this helper is not a background scheduler.
    """
    today = timezone.localdate()
    goals = SavingsGoal.objects.filter(
        user=user,
        target_date__isnull=False,
    )

    for goal in goals:
        target_amount = goal.target_amount or 0
        current_amount = goal.current_amount or 0

        # Completed goals do not need deadline reminders.
        if target_amount <= 0 or current_amount >= target_amount:
            continue

        days_remaining = (goal.target_date - today).days
        if 0 <= days_remaining <= 7:
            reminder_type = "upcoming"
            if days_remaining == 0:
                timing_text = "Your target date is today."
            elif days_remaining == 1:
                timing_text = "Your target date is tomorrow."
            else:
                timing_text = f"Your target date is in {days_remaining} days."
            encouragement = "Keep saving toward your goal!"
        elif goal.target_date < today:
            reminder_type = "overdue"
            days_overdue = abs(days_remaining)
            day_word = "day" if days_overdue == 1 else "days"
            timing_text = (
                f"Your target date passed {days_overdue} {day_word} ago."
            )
            encouragement = "Review your progress or update your target date."
        else:
            continue

        notification_prefix = (
            f"Savings reminder — goal {goal.pk} "
            f"({goal.target_date}, {reminder_type}):"
        )

        already_notified = Notification.objects.filter(
            user=user,
            message__startswith=notification_prefix,
        ).exists()

        if not already_notified:
            Notification.objects.create(
                user=user,
                message=(
                    f"{notification_prefix} {timing_text} You have saved "
                    f"₹{current_amount:,.2f} of ₹{target_amount:,.2f}. "
                    f"{encouragement}"
                ),
            )


def create_monthly_report_reminder(user):
    """Create one reminder during the first week of each month.

    The reminder asks the user to generate the previous month's report.
    It is generated when the authenticated app requests notifications, not
    by a background scheduler. An existing report for the exact month
    suppresses the reminder.
    """
    today = timezone.localdate()

    # Only show the reminder during the first seven days of a new month.
    if today.day > 7:
        return

    previous_month_end = today.replace(day=1) - timedelta(days=1)
    previous_month_start = previous_month_end.replace(day=1)
    month_label = previous_month_start.strftime("%B %Y")
    month_key = previous_month_start.strftime("%Y-%m")

    # Do not ask users to generate a report that already exists for this month.
    report_exists = Report.objects.filter(
        user=user,
        start_date=previous_month_start,
        end_date=previous_month_end,
    ).exists()
    if report_exists:
        return

    notification_prefix = f"Monthly report reminder — {month_key}:"
    already_notified = Notification.objects.filter(
        user=user,
        message__startswith=notification_prefix,
    ).exists()

    if not already_notified:
        Notification.objects.create(
            user=user,
            message=(
                f"{notification_prefix} Your {month_label} financial report "
                "is ready to generate. Review your income and expenses, "
                "then create your monthly report in BudgetBuddy."
            ),
        )


def send_budget_alert_email(user, alert_message):
    """Email a budget alert to the user's registered email address.

    Email errors are logged but do not interrupt the budget summary API.
    """
    recipient_email = (getattr(user, "email", "") or "").strip()
    if not recipient_email:
        logger.warning(
            "Budget alert email skipped: user %s has no registered email address.",
            user.pk,
        )
        return False

    email_body = (
        f"Hello {user.get_username()},\n\n"
        f"{alert_message}\n\n"
        "Please sign in to BudgetBuddy to review your spending and budget.\n\n"
        "Regards,\n"
        "BudgetBuddy"
    )

    subject = (
        "BudgetBuddy - Budget Exceeded"
        if "over budget" in alert_message
        else "BudgetBuddy - Budget Limit Reached"
    )

    try:
        sent_count = send_mail(
            subject=subject,
            message=email_body,
            from_email=None,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        return sent_count == 1
    except Exception:
        logger.exception(
            "Failed to send a budget alert email to user %s.", user.pk
        )
        return False

# Import serializers for Expense, Income, and Budget models
from .serializers import (
    ExpenseSerializer,
    IncomeSerializer,
    BudgetSerializer,
    SavingsGoalSerializer,
    NotificationSerializer,
    ReportSerializer,
)

# Import Expense, Income, and Budget models
from .models import Income, Expense, Budget, SavingsGoal, Notification, Report


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
        today = timezone.localdate()
        current_month = today.month
        current_year = today.year
        month_label = today.strftime("%B %Y")

        budgets = Budget.objects.filter(
            user=request.user,
            month=current_month,
            year=current_year
        )

        summary = []

        for budget in budgets:
            total_spent = Expense.objects.filter(
                user=request.user,
                category__iexact=budget.category,
                date__month=current_month,
                date__year=current_year
            ).aggregate(total=Sum("amount"))["total"] or 0

            remaining = budget.limit_amount - total_spent
            percentage_used = (
                (total_spent / budget.limit_amount) * 100
                if budget.limit_amount > 0 else 0
            )
            over_budget_amount = max(total_spent - budget.limit_amount, 0)

            # Create or refresh one detailed alert per category and month.
            # Updating the existing notification lets the frontend polling
            # detect changed text and show a fresh in-app/desktop alert.
            if budget.limit_amount > 0 and total_spent >= budget.limit_amount:
                alert_key = (
                    f"Budget alert — {budget.category} "
                    f"({current_year}-{current_month:02d}):"
                )

                if total_spent > budget.limit_amount:
                    alert_message = (
                        f"{alert_key} You spent ₹{total_spent:,.2f} against "
                        f"a ₹{budget.limit_amount:,.2f} limit. You are "
                        f"₹{over_budget_amount:,.2f} over budget "
                        f"({percentage_used:,.2f}% used)."
                    )
                else:
                    alert_message = (
                        f"{alert_key} You have reached your budget limit. "
                        f"You spent ₹{total_spent:,.2f} of "
                        f"₹{budget.limit_amount:,.2f} "
                        f"(100.00% used)."
                    )

                existing_notification = Notification.objects.filter(
                    user=request.user,
                    message__startswith=alert_key
                ).order_by("-created_at").first()

                # Upgrade the older generic alert instead of creating a duplicate.
                if existing_notification is None:
                    legacy_prefix = (
                        f"Your {budget.category} budget has reached its limit of"
                    )
                    existing_notification = Notification.objects.filter(
                        user=request.user,
                        message__startswith=legacy_prefix
                    ).order_by("-created_at").first()

                if existing_notification:
                    # Send one email when upgrading an older generic alert to
                    # the detailed alert format. Later polling updates only
                    # refresh the in-app notification and do not resend email.
                    is_legacy_alert = not existing_notification.message.startswith(
                        alert_key
                    )
                    was_only_reached = "You have reached your budget limit" in existing_notification.message

                    if existing_notification.message != alert_message:
                        existing_notification.message = alert_message
                        existing_notification.is_read = False
                        existing_notification.created_at = timezone.now()
                        existing_notification.save(
                            update_fields=["message", "is_read", "created_at"]
                        )

                        if is_legacy_alert or (was_only_reached and total_spent > budget.limit_amount):
                            send_budget_alert_email(request.user, alert_message)
                else:
                    Notification.objects.create(
                        user=request.user,
                        message=alert_message
                    )
                    # A new notification is the first threshold alert for
                    # this category/month, so send one email to the account.
                    send_budget_alert_email(request.user, alert_message)

            summary.append({
                "category": budget.category,
                "budget_limit": budget.limit_amount,
                "total_spent": total_spent,
                "remaining": remaining,
                "percentage_used": round(percentage_used, 2),
                "over_budget_amount": over_budget_amount,
                "is_exceeded": total_spent > budget.limit_amount,
                "is_limit_reached": total_spent >= budget.limit_amount
            })

        return Response(summary)

# List, create, and manage savings goals
class SavingsGoalListCreateView(generics.ListCreateAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        goal = serializer.save(user=self.request.user)
        # Also recognize milestones when a goal is created with an amount
        # that is already partially or fully saved.
        create_savings_goal_milestone_notifications(goal, previous_amount=0)


# Retrieve, update, and delete a savings goal
class SavingsGoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        previous_amount = serializer.instance.current_amount or 0
        goal = serializer.save()
        create_savings_goal_milestone_notifications(
            goal,
            previous_amount=previous_amount,
        )


class NotificationListCreateView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        create_savings_goal_reminders(self.request.user)
        create_monthly_report_reminder(self.request.user)
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class FinancialAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        current_month = today.month
        current_year = today.year

        # Calculate monthly income
        total_income = Income.objects.filter(
            user=request.user,
            date__month=current_month,
            date__year=current_year
        ).aggregate(total=Sum("amount"))["total"] or 0

        # Calculate monthly expenses
        total_expenses = Expense.objects.filter(
            user=request.user,
            date__month=current_month,
            date__year=current_year
        ).aggregate(total=Sum("amount"))["total"] or 0

        # Calculate balance and savings
        balance = total_income - total_expenses

        # Calculate category-wise expenses
        category_expenses = Expense.objects.filter(
            user=request.user,
            date__month=current_month,
            date__year=current_year
        ).values("category").annotate(
            total=Sum("amount")
        ).order_by("-total")

        return Response({
            "month": current_month,
            "year": current_year,
            "total_income": total_income,
            "total_expenses": total_expenses,
            "balance": balance,
            "category_expenses": list(category_expenses)
        })

# List and create financial reports
class ReportListCreateView(generics.ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Retrieve and delete a financial report
class ReportDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=self.request.user)
# Generate and download a financial report as PDF
class ReportPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            report = Report.objects.get(
                pk=pk,
                user=request.user
            )
        except Report.DoesNotExist:
            return Response(
                {"error": "Report not found"},
                status=404
            )

        # Get transactions within the report date range
        incomes = Income.objects.filter(
            user=request.user,
            date__range=(report.start_date, report.end_date)
        ).order_by("date")

        expenses = Expense.objects.filter(
            user=request.user,
            date__range=(report.start_date, report.end_date)
        ).order_by("date")

        # Calculate totals
        total_income = incomes.aggregate(
            total=Sum("amount")
        )["total"] or 0

        total_expenses = expenses.aggregate(
            total=Sum("amount")
        )["total"] or 0

        balance = total_income - total_expenses

        category_totals = (
            expenses.values("category")
            .annotate(total=Sum("amount"))
            .order_by("category")
        )

        # Create PDF
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)

        page_width, page_height = A4
        y = page_height - 50

        def write_line(text, font="Helvetica", size=10):
            nonlocal y

            pdf.setFont(font, size)

            wrapped_lines = simpleSplit(
                str(text),
                font,
                size,
                page_width - 100
            )

            for line in wrapped_lines:
                if y < 50:
                    pdf.showPage()
                    y = page_height - 50
                    pdf.setFont(font, size)

                pdf.drawString(50, y, line)
                y -= size + 6

        pdf.setTitle(report.title)

        # Report heading
        write_line(report.title, "Helvetica-Bold", 18)
        y -= 15

        write_line(
            f"Start Date: {report.start_date}"
        )
        write_line(
            f"End Date: {report.end_date}"
        )
        write_line(
            f"Generated On: {report.created_at}"
        )

        y -= 20

        # Financial summary
        write_line(
            "FINANCIAL SUMMARY",
            "Helvetica-Bold",
            14
        )
        write_line(
            f"Total Income: Rs. {total_income:.2f}"
        )
        write_line(
            f"Total Expenses: Rs. {total_expenses:.2f}"
        )
        write_line(
            f"Remaining Balance: Rs. {balance:.2f}"
        )

        y -= 20

        # Category-wise expenses
        write_line(
            "EXPENSES BY CATEGORY",
            "Helvetica-Bold",
            14
        )

        if category_totals:
            for item in category_totals:
                write_line(
                    f"{item['category']}: "
                    f"Rs. {item['total']:.2f}"
                )
        else:
            write_line("No expenses in this period.")

        y -= 20

        # Income transactions
        write_line(
            "INCOME TRANSACTIONS",
            "Helvetica-Bold",
            14
        )

        if incomes.exists():
            for item in incomes:
                write_line(
                    f"{item.date} | {item.source} | "
                    f"Rs. {item.amount}"
                )
        else:
            write_line("No income records in this period.")

        y -= 20

        # Expense transactions
        write_line(
            "EXPENSE TRANSACTIONS",
            "Helvetica-Bold",
            14
        )

        if expenses.exists():
            for item in expenses:
                write_line(
                    f"{item.date} | {item.title} | "
                    f"{item.category} | Rs. {item.amount}"
                )
        else:
            write_line("No expense records in this period.")

        pdf.save()

        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/pdf"
        )

        response["Content-Disposition"] = (
            f'attachment; filename="report_{report.id}.pdf"'
        )

        buffer.close()
        return response
    # Generate and download a financial report as Excel

# Generate and download a professionally formatted Excel report
class ReportExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            report = Report.objects.get(
                pk=pk,
                user=request.user
            )
        except Report.DoesNotExist:
            return Response(
                {"error": "Report not found"},
                status=404
            )

        # Retrieve only this user's transactions within the report period.
        incomes = list(
            Income.objects.filter(
                user=request.user,
                date__range=(report.start_date, report.end_date)
            ).order_by("date", "id")
        )
        expenses = list(
            Expense.objects.filter(
                user=request.user,
                date__range=(report.start_date, report.end_date)
            ).order_by("date", "id")
        )

        # Calculate totals from the same transaction lists used in the tables.
        total_income = sum((item.amount for item in incomes), 0)
        total_expenses = sum((item.amount for item in expenses), 0)
        balance = total_income - total_expenses

        category_totals = list(
            Expense.objects.filter(
                user=request.user,
                date__range=(report.start_date, report.end_date)
            )
            .values("category")
            .annotate(total=Sum("amount"))
            .order_by("category")
        )

        # Create workbook and worksheet.
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "Financial Report"
        sheet.sheet_view.showGridLines = False

        # Reusable styles.
        title_fill = PatternFill(fill_type="solid", fgColor="087F68")
        section_fill = PatternFill(fill_type="solid", fgColor="DDEFEA")
        header_fill = PatternFill(fill_type="solid", fgColor="EAF4F1")

        title_font = Font(
            name="Arial", size=16, bold=True, color="FFFFFF"
        )
        section_font = Font(
            name="Arial", size=11, bold=True, color="087F68"
        )
        header_font = Font(name="Arial", size=10, bold=True)
        normal_font = Font(name="Arial", size=10)
        currency_format = '"₹"#,##0.00'

        # Report title.
        sheet.merge_cells("A1:D1")
        title_cell = sheet["A1"]
        title_cell.value = report.title
        title_cell.font = title_font
        title_cell.fill = title_fill
        title_cell.alignment = Alignment(
            horizontal="center", vertical="center"
        )
        sheet.row_dimensions[1].height = 30

        # Report metadata, matching the PDF report.
        metadata = [
            ("Start Date", str(report.start_date)),
            ("End Date", str(report.end_date)),
            ("Generated On", str(report.created_at)),
        ]
        for row_number, (label, value) in enumerate(metadata, start=3):
            sheet.cell(row_number, 1, label).font = header_font
            sheet.cell(row_number, 2, value).font = normal_font

        current_row = 7

        def add_section(section_title):
            nonlocal current_row
            sheet.merge_cells(
                start_row=current_row,
                start_column=1,
                end_row=current_row,
                end_column=4
            )
            cell = sheet.cell(current_row, 1, section_title)
            cell.font = section_font
            cell.fill = section_fill
            cell.alignment = Alignment(vertical="center")
            sheet.row_dimensions[current_row].height = 20
            current_row += 1

        def add_headers(headers):
            nonlocal current_row
            for column_number, heading in enumerate(headers, start=1):
                cell = sheet.cell(current_row, column_number, heading)
                cell.font = header_font
                cell.fill = header_fill
            current_row += 1

        # Financial summary.
        add_section("FINANCIAL SUMMARY")
        for label, value in [
            ("Total Income", total_income),
            ("Total Expenses", total_expenses),
            ("Remaining Balance", balance),
        ]:
            sheet.cell(current_row, 1, label).font = header_font
            amount_cell = sheet.cell(current_row, 2, float(value))
            amount_cell.number_format = currency_format
            amount_cell.font = normal_font
            current_row += 1
        current_row += 1

        # Expenses by category.
        add_section("EXPENSES BY CATEGORY")
        add_headers(["Category", "Amount"])
        if category_totals:
            for item in category_totals:
                sheet.cell(current_row, 1, item["category"]).font = normal_font
                amount_cell = sheet.cell(
                    current_row, 2, float(item["total"])
                )
                amount_cell.number_format = currency_format
                current_row += 1
        else:
            sheet.cell(
                current_row, 1, "No expenses in this period."
            ).font = normal_font
            current_row += 1
        current_row += 1

        # Income transactions.
        add_section("INCOME TRANSACTIONS")
        add_headers(["Date", "Source", "Amount"])
        if incomes:
            for item in incomes:
                sheet.cell(current_row, 1, str(item.date)).font = normal_font
                sheet.cell(current_row, 2, item.source).font = normal_font
                amount_cell = sheet.cell(
                    current_row, 3, float(item.amount)
                )
                amount_cell.number_format = currency_format
                current_row += 1
        else:
            sheet.cell(
                current_row, 1, "No income records in this period."
            ).font = normal_font
            current_row += 1
        current_row += 1

        # Expense transactions.
        add_section("EXPENSE TRANSACTIONS")
        add_headers(["Date", "Title", "Category", "Amount"])
        if expenses:
            for item in expenses:
                sheet.cell(current_row, 1, str(item.date)).font = normal_font
                sheet.cell(current_row, 2, item.title).font = normal_font
                sheet.cell(current_row, 3, item.category).font = normal_font
                amount_cell = sheet.cell(
                    current_row, 4, float(item.amount)
                )
                amount_cell.number_format = currency_format
                current_row += 1
        else:
            sheet.cell(
                current_row, 1, "No expense records in this period."
            ).font = normal_font
            current_row += 1

        # Set readable widths without accessing MergedCell.column_letter.
        for column_number in range(1, sheet.max_column + 1):
            column_letter = get_column_letter(column_number)
            max_length = max(
                len(str(sheet.cell(row=row_number, column=column_number).value or ""))
                for row_number in range(1, sheet.max_row + 1)
            )
            sheet.column_dimensions[column_letter].width = min(
                max(max_length + 4, 15), 40
            )

        # Make the worksheet easier to navigate and print.
        sheet.freeze_panes = "A7"
        sheet.page_setup.orientation = "landscape"
        sheet.page_setup.fitToWidth = 1
        sheet.page_setup.fitToHeight = 0
        sheet.sheet_properties.pageSetUpPr.fitToPage = True
        sheet.print_title_rows = "1:7"

        # Save to memory first, then return a concrete HTTP response.
        excel_buffer = BytesIO()
        workbook.save(excel_buffer)
        excel_buffer.seek(0)

        response = HttpResponse(
            excel_buffer.getvalue(),
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            )
        )
        response["Content-Disposition"] = (
            f'attachment; filename="report_{report.id}.xlsx"'
        )
        excel_buffer.close()
        return response
