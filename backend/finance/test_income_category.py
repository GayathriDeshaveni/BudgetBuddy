from django.contrib.auth import get_user_model
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TestCase, TransactionTestCase
from django.utils import timezone
from rest_framework.test import APIClient

User = get_user_model()


class IncomeCategoryApiChecks(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="anu", email="a@x.com", password="StrongPass123")
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.today = str(timezone.localdate())

    def _post(self, **extra):
        data = {"source": "November scholarship", "amount": "4500", "date": self.today, "notes": ""}
        data.update(extra)
        return self.client.post("/api/incomes/", data, format="json")

    def test_category_is_saved_and_returned(self):
        r = self._post(category="Scholarship")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(r.json()["category"], "Scholarship")
        listed = self.client.get("/api/incomes/").json()
        self.assertEqual(listed[0]["category"], "Scholarship")

    def test_category_defaults_to_other_when_missing(self):
        r = self._post()
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(r.json()["category"], "Other")

    def test_lowercase_is_normalised(self):
        r = self._post(category="pocket money")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(r.json()["category"], "Pocket Money")

    def test_unknown_category_rejected(self):
        r = self._post(category="Hacking")
        self.assertEqual(r.status_code, 400)
        self.assertIn("category", r.json())

    def test_editing_amount_still_works(self):
        iid = self._post(category="Freelance").json()["id"]
        r = self.client.patch(f"/api/incomes/{iid}/", {"amount": "5000.00"}, format="json")
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()["category"], "Freelance")


class IncomeCategoryMigrationCheck(TransactionTestCase):
    """Existing income records get a sensible category when the migration runs."""

    migrate_from = [("finance", "0003_profile_email_alerts")]
    migrate_to = [("finance", "0004_income_category")]

    def test_existing_records_are_categorised(self):
        executor = MigrationExecutor(connection)
        executor.migrate(self.migrate_from)
        old_apps = executor.loader.project_state(self.migrate_from).apps

        OldUser = old_apps.get_model("accounts", "User")
        OldIncome = old_apps.get_model("finance", "Income")
        user = OldUser.objects.create(username="old", password="x")
        for source in ("pocket money", "Scholarship", "Freelance work", "salary Nov", "gift from uncle"):
            OldIncome.objects.create(user=user, source=source, amount="100", date="2026-11-01")

        executor = MigrationExecutor(connection)
        executor.loader.build_graph()
        executor.migrate(self.migrate_to)
        new_apps = executor.loader.project_state(self.migrate_to).apps
        NewIncome = new_apps.get_model("finance", "Income")
        result = {i.source: i.category for i in NewIncome.objects.all()}
        self.assertEqual(result, {
            "pocket money": "Pocket Money",
            "Scholarship": "Scholarship",
            "Freelance work": "Freelance",
            "salary Nov": "Salary",
            "gift from uncle": "Other",
        })