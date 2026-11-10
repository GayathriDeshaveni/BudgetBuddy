from rest_framework.permissions import BasePermission


class IsPremiumOrAdmin(BasePermission):
    """Allow only logged-in Premium users and Admins.

    Students receive a 403 error with the message below.
    """

    message = "PDF and Excel export is available to Premium users only."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None) in ("PREMIUM", "ADMIN")
        )