from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Notification

User = get_user_model()


class Milestone3Checks(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="anu", email="anu@example.com", password="StrongPass123"
        )
        self.other = User.objects.create_user(
            username="other", email="other@example.com", password="StrongPass123"
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.today = timezone.localdate()

    def msgs(self, user=None):
        return list(
            Notification.objects.filter(user=user or self.user)
            .order_by("id")
            .values_list("message", flat=True)
        )

    # ---------- Savings goals ----------
    def test_savings_goal_crud_and_milestones(self):
        r = self.client.post("/api/savings-goals/", {
            "title": "Laptop", "target_amount": "2000", "current_amount": "0",
        }, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        gid = r.json()["id"]

        # 0 -> 1000 should create the 25% and 50% milestones
        r = self.client.patch(f"/api/savings-goals/{gid}/",
                              {"current_amount": "1000.00"}, format="json")
        self.assertEqual(r.status_code, 200, r.content)
        m = self.msgs()
        self.assertTrue(any("(25%)" in x for x in m), m)
        self.assertTrue(any("(50%)" in x for x in m), m)
        self.assertFalse(any("(75%)" in x for x in m), m)

        # Updating again to same amount must not duplicate
        before = len(self.msgs())
        self.client.patch(f"/api/savings-goals/{gid}/",
                          {"current_amount": "1000.00"}, format="json")
        self.assertEqual(len(self.msgs()), before)

        # 1000 -> 2000 gives 75% and 100%
        self.client.patch(f"/api/savings-goals/{gid}/",
                          {"current_amount": "2000.00"}, format="json")
        m = self.msgs()
        self.assertTrue(any("(75%)" in x for x in m))
        self.assertTrue(any("(100%)" in x for x in m))

        r = self.client.delete(f"/api/savings-goals/{gid}/")
        self.assertEqual(r.status_code, 204)

    def test_savings_reminders(self):
        due = self.today + timedelta(days=3)
        self.client.post("/api/savings-goals/", {
            "title": "Trip", "target_amount": "5000", "current_amount": "100",
            "target_date": str(due),
        }, format="json")
        self.client.get("/api/notifications/")
        self.assertTrue(any("Savings reminder" in x and "upcoming" in x
                            for x in self.msgs()), self.msgs())
        # No duplicate on second poll
        n = len(self.msgs())
        self.client.get("/api/notifications/")
        self.assertEqual(len(self.msgs()), n)

    # ---------- Budget alerts + email ----------
    def _budget(self, category, limit):
        r = self.client.post("/api/budgets/", {
            "category": category, "limit_amount": str(limit),
            "month": self.today.month, "year": self.today.year,
        }, format="json")
        self.assertIn(r.status_code, (200, 201), r.content)

    def _expense(self, category, amount, title="x"):
        r = self.client.post("/api/expenses/", {
            "title": title, "category": category, "amount": str(amount),
            "date": str(self.today), "notes": "",
        }, format="json")
        self.assertEqual(r.status_code, 201, r.content)

    def test_budget_alert_and_emails(self):
        self._budget("Education", 500)

        # Under limit: no alert, no email
        self._expense("Education", 300)
        r = self.client.get("/api/budgets/summary/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)
        self.assertFalse(any("Budget alert" in x for x in self.msgs()))

        # Exactly 100%: alert + email #1
        self._expense("Education", 200)
        self.client.get("/api/budgets/summary/")
        self.assertTrue(any("reached your budget limit" in x for x in self.msgs()))
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Limit Reached", mail.outbox[0].subject)
        self.assertEqual(mail.outbox[0].to, ["anu@example.com"])

        # Polling again must not resend
        self.client.get("/api/budgets/summary/")
        self.assertEqual(len(mail.outbox), 1)

        # Over by Rs 1: alert text updates, email #2 (exceeded)
        self._expense("Education", 1)
        data = self.client.get("/api/budgets/summary/").json()
        self.assertTrue(any("over budget" in x for x in self.msgs()))
        self.assertEqual(len(mail.outbox), 2)
        self.assertIn("Exceeded", mail.outbox[1].subject)
        edu = [b for b in data if b["category"] == "Education"][0]
        self.assertTrue(edu["is_exceeded"])

        # Further spending: in-app alert refreshes but no 3rd email
        self._expense("Education", 50)
        self.client.get("/api/budgets/summary/")
        self.client.get("/api/budgets/summary/")
        self.assertEqual(len(mail.outbox), 2)
        # still only ONE notification row for this category/month
        rows = [x for x in self.msgs() if x.startswith("Budget alert — Education")]
        self.assertEqual(len(rows), 1, rows)

    def test_jump_straight_over_budget_sends_one_email(self):
        self._budget("Food", 100)
        self._expense("Food", 150)
        self.client.get("/api/budgets/summary/")
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Exceeded", mail.outbox[0].subject)

    # ---------- Notifications ----------
    def test_notification_read_delete_and_isolation(self):
        Notification.objects.create(user=self.user, message="Mine")
        Notification.objects.create(user=self.other, message="Not mine")
        r = self.client.get("/api/notifications/")
        texts = [n["message"] for n in r.json()]
        self.assertIn("Mine", texts)
        self.assertNotIn("Not mine", texts)

        nid = Notification.objects.get(user=self.user, message="Mine").id
        r = self.client.patch(f"/api/notifications/{nid}/",
                              {"is_read": True}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(Notification.objects.get(id=nid).is_read)

        # cannot touch another user's notification
        oid = Notification.objects.get(user=self.other).id
        r = self.client.delete(f"/api/notifications/{oid}/")
        self.assertEqual(r.status_code, 404)

        r = self.client.delete(f"/api/notifications/{nid}/")
        self.assertEqual(r.status_code, 204)

    def test_monthly_report_reminder_first_week_only(self):
        self.client.get("/api/notifications/")
        has = any(x.startswith("Monthly report reminder") for x in self.msgs())
        self.assertEqual(has, self.today.day <= 7,
                         f"day={self.today.day} msgs={self.msgs()}")

    # ---------- Analytics ----------
    def test_analytics_endpoint(self):
        self.client.post("/api/incomes/", {
            "source": "pocket money", "amount": "1000",
            "date": str(self.today), "notes": ""}, format="json")
        self._expense("Food", 400)
        self._expense("Travel", 100)
        r = self.client.get("/api/analytics/")
        self.assertEqual(r.status_code, 200, r.content)
        d = r.json()
        for k in ("total_income", "total_expenses", "balance", "category_expenses"):
            self.assertIn(k, d)
        self.assertEqual(Decimal(str(d["balance"])), Decimal("500"))
        cats = {c["category"]: Decimal(str(c["total"])) for c in d["category_expenses"]}
        self.assertEqual(cats["Food"], Decimal("400"))

    # ---------- Reports ----------
    def test_report_create_pdf_excel(self):
        # PDF/Excel export is a Premium feature, so use Premium accounts here.
        self.user.role = User.Role.PREMIUM
        self.user.save()
        self.other.role = User.Role.PREMIUM
        self.other.save()
        self.client.post("/api/incomes/", {
            "source": "scholarship", "amount": "4500",
            "date": str(self.today), "notes": ""}, format="json")
        self._expense("Food", 500, "lunch")
        start = self.today.replace(day=1)
        r = self.client.post("/api/reports/", {
            "title": "Nov Report", "start_date": str(start),
            "end_date": str(self.today)}, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        rid = r.json()["id"]

        pdf = self.client.get(f"/api/reports/{rid}/pdf/")
        self.assertEqual(pdf.status_code, 200)
        self.assertEqual(pdf["Content-Type"], "application/pdf")
        self.assertTrue(pdf.content.startswith(b"%PDF"))

        xls = self.client.get(f"/api/reports/{rid}/excel/")
        self.assertEqual(xls.status_code, 200)
        self.assertTrue(xls.content.startswith(b"PK"))  # xlsx is a zip

        # another user cannot download it
        other = APIClient()
        other.force_authenticate(self.other)
        self.assertEqual(other.get(f"/api/reports/{rid}/pdf/").status_code, 404)

        self.assertEqual(self.client.delete(f"/api/reports/{rid}/").status_code, 204)

    # ---------- Auth guard ----------
    def test_endpoints_require_login(self):
        anon = APIClient()
        for url in ("/api/savings-goals/", "/api/notifications/",
                    "/api/budgets/summary/", "/api/analytics/", "/api/reports/"):
            self.assertEqual(anon.get(url).status_code, 401, url)