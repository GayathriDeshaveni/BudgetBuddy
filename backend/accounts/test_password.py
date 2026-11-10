from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

User = get_user_model()
URL = "/api/auth/change-password/"


class ChangePasswordChecks(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="anu", email="a@x.com", password="OldPass#2026")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def _post(self, **overrides):
        data = {"current_password": "OldPass#2026", "new_password": "NewPass#2027", "confirm_password": "NewPass#2027"}
        data.update(overrides)
        return self.client.post(URL, data, format="json")

    def _can_login(self, password):
        return APIClient().post("/api/auth/login/", {"username": "anu", "password": password}, format="json").status_code == 200

    def test_success_changes_password(self):
        r = self._post()
        self.assertEqual(r.status_code, 200, r.content)
        self.assertTrue(self._can_login("NewPass#2027"))
        self.assertFalse(self._can_login("OldPass#2026"))

    def test_wrong_current_password(self):
        r = self._post(current_password="WrongPass#1")
        self.assertEqual(r.status_code, 400)
        self.assertIn("incorrect", str(r.json()["current_password"]))
        self.assertTrue(self._can_login("OldPass#2026"))   # unchanged

    def test_confirmation_must_match(self):
        r = self._post(confirm_password="Different#2027")
        self.assertEqual(r.status_code, 400)
        self.assertIn("confirm_password", r.json())
        self.assertTrue(self._can_login("OldPass#2026"))

    def test_weak_passwords_rejected(self):
        for weak in ("short1", "12345678", "password"):
            r = self._post(new_password=weak, confirm_password=weak)
            self.assertEqual(r.status_code, 400, weak)
            self.assertIn("new_password", r.json(), weak)
        self.assertTrue(self._can_login("OldPass#2026"))

    def test_new_must_differ_from_current(self):
        r = self._post(new_password="OldPass#2026", confirm_password="OldPass#2026")
        self.assertEqual(r.status_code, 400)
        self.assertIn("new_password", r.json())

    def test_requires_login(self):
        r = APIClient().post(URL, {"current_password": "x", "new_password": "y", "confirm_password": "y"}, format="json")
        self.assertEqual(r.status_code, 401)

    def test_missing_fields(self):
        r = self.client.post(URL, {}, format="json")
        self.assertEqual(r.status_code, 400)