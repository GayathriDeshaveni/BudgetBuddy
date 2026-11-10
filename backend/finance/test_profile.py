from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Notification, Profile

User = get_user_model()


class ProfileChecks(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="anu", email="anu@example.com", password="StrongPass123")
        self.other = User.objects.create_user(username="other", email="o@example.com", password="StrongPass123")
        self.client = APIClient(); self.client.force_authenticate(self.user)
        self.today = timezone.localdate()

    def test_get_creates_profile_with_defaults(self):
        self.assertFalse(Profile.objects.filter(user=self.user).exists())
        r = self.client.get("/api/profile/")
        self.assertEqual(r.status_code, 200, r.content)
        d = r.json()
        self.assertEqual(d["username"], "anu")
        self.assertEqual(d["email"], "anu@example.com")
        self.assertEqual(d["role"], "Student")
        self.assertIn("member_since", d)
        self.assertTrue(d["member_since"].startswith(str(self.user.date_joined.year)))
        self.assertEqual(d["monthly_income"], "0.00")
        self.assertTrue(d["email_alerts"])
        self.assertTrue(Profile.objects.filter(user=self.user).exists())

    def test_update_income_and_preference(self):
        r = self.client.patch("/api/profile/", {"monthly_income": "25000.50", "email_alerts": False}, format="json")
        self.assertEqual(r.status_code, 200, r.content)
        r = self.client.get("/api/profile/").json()
        self.assertEqual(r["monthly_income"], "25000.50")
        self.assertFalse(r["email_alerts"])

    def test_validation(self):
        r = self.client.patch("/api/profile/", {"monthly_income": "-1"}, format="json")
        self.assertEqual(r.status_code, 400)
        r = self.client.patch("/api/profile/", {"monthly_income": "abc"}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_cannot_change_role_or_identity(self):
        before = (self.user.role, self.user.username, self.user.email)
        self.client.patch("/api/profile/", {"role": "ADMIN", "username": "hacker", "email": "h@x.com"}, format="json")
        self.user.refresh_from_db()
        self.assertEqual((self.user.role, self.user.username, self.user.email), before)

    def test_profiles_are_separate_and_need_login(self):
        self.client.patch("/api/profile/", {"monthly_income": "111"}, format="json")
        other = APIClient(); other.force_authenticate(self.other)
        self.assertEqual(other.get("/api/profile/").json()["monthly_income"], "0.00")
        self.assertEqual(APIClient().get("/api/profile/").status_code, 401)

    def _over_budget(self, category):
        self.client.post("/api/budgets/", {"category": category, "limit_amount": "100", "month": self.today.month, "year": self.today.year}, format="json")
        self.client.post("/api/expenses/", {"title": "x", "category": category, "amount": "100", "date": str(self.today), "notes": ""}, format="json")
        self.client.get("/api/budgets/summary/")

    def test_email_preference_controls_budget_emails(self):
        # Preference ON (default): email is sent
        self._over_budget("Food")
        self.assertEqual(len(mail.outbox), 1)
        # Preference OFF: in-app alert still created, but no email
        self.client.patch("/api/profile/", {"email_alerts": False}, format="json")
        self._over_budget("Travel")
        self.assertEqual(len(mail.outbox), 1)
        self.assertTrue(Notification.objects.filter(user=self.user, message__startswith="Budget alert — Travel").exists())
        # Back ON: next new alert emails again
        self.client.patch("/api/profile/", {"email_alerts": True}, format="json")
        self._over_budget("Bills")
        self.assertEqual(len(mail.outbox), 2)