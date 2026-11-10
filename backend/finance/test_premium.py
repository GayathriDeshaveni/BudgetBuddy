from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

User = get_user_model()


class PremiumExportChecks(TestCase):
    def setUp(self):
        self.today = timezone.localdate()
        self.student = User.objects.create_user(username="stu", email="s@x.com", password="StrongPass123")
        self.premium = User.objects.create_user(username="pre", email="p@x.com", password="StrongPass123", role=User.Role.PREMIUM)
        self.admin = User.objects.create_user(username="adm", email="a@x.com", password="StrongPass123", role=User.Role.ADMIN)

    def _client(self, user):
        c = APIClient(); c.force_authenticate(user); return c

    def _make_report(self, client):
        r = client.post("/api/reports/", {"title": "R", "start_date": str(self.today.replace(day=1)), "end_date": str(self.today)}, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        return r.json()["id"]

    def test_student_can_use_reports_but_not_export(self):
        c = self._client(self.student)
        rid = self._make_report(c)                       # create works
        self.assertEqual(c.get("/api/reports/").status_code, 200)   # list works
        pdf = c.get(f"/api/reports/{rid}/pdf/")
        xls = c.get(f"/api/reports/{rid}/excel/")
        self.assertEqual(pdf.status_code, 403)
        self.assertEqual(xls.status_code, 403)
        self.assertIn("Premium", pdf.json()["detail"])

    def test_premium_can_export(self):
        c = self._client(self.premium)
        rid = self._make_report(c)
        pdf = c.get(f"/api/reports/{rid}/pdf/")
        xls = c.get(f"/api/reports/{rid}/excel/")
        self.assertEqual(pdf.status_code, 200)
        self.assertTrue(pdf.content.startswith(b"%PDF"))
        self.assertEqual(xls.status_code, 200)
        self.assertTrue(xls.content.startswith(b"PK"))

    def test_admin_can_export(self):
        c = self._client(self.admin)
        rid = self._make_report(c)
        self.assertEqual(c.get(f"/api/reports/{rid}/pdf/").status_code, 200)

    def test_anonymous_is_rejected(self):
        rid = self._make_report(self._client(self.premium))
        anon = APIClient()
        self.assertEqual(anon.get(f"/api/reports/{rid}/pdf/").status_code, 401)
        self.assertEqual(anon.get(f"/api/reports/{rid}/excel/").status_code, 401)

    def test_upgrading_role_unlocks_export_immediately(self):
        c = self._client(self.student)
        rid = self._make_report(c)
        self.assertEqual(c.get(f"/api/reports/{rid}/pdf/").status_code, 403)
        self.student.role = User.Role.PREMIUM          # what an admin does in Django Admin
        self.student.save()
        self.assertEqual(c.get(f"/api/reports/{rid}/pdf/").status_code, 200)

    def test_me_endpoint_returns_role_code(self):
        d = self._client(self.premium).get("/api/auth/me/").json()
        self.assertEqual(d["role"], "PREMIUM")