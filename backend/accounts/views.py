import logging

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ChangePasswordSerializer, RegisterSerializer

logger = logging.getLogger(__name__)
User = get_user_model()


class IsBudgetBuddyAdmin(BasePermission):
    """Allow access only to users with BudgetBuddy's ADMIN role."""

    message = "Only BudgetBuddy administrators can access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == User.Role.ADMIN
        )


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        # RegisterSerializer intentionally does not accept a role field.
        # New users therefore receive the model's default STUDENT role.
        user = serializer.save()
        recipient_email = (user.email or "").strip()

        if not recipient_email:
            logger.warning(
                "Registration email skipped: new user %s has no email address.",
                user.pk,
            )
            return

        subject = "Welcome to BudgetBuddy - Registration Successful"
        message = (
            f"Hello {user.username},\n\n"
            "Your BudgetBuddy account has been created successfully.\n\n"
            "You can now log in and start managing your income, expenses, "
            "budgets, and savings goals.\n\n"
            "Thank you for joining BudgetBuddy!\n\n"
            "Regards,\n"
            "BudgetBuddy Team"
        )

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=None,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
        except Exception:
            # A mail failure must not undo a successful account registration.
            logger.exception(
                "Registration email could not be sent to user %s.", user.pk
            )


class ProtectedTestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "JWT authentication successful!",
            "username": request.user.username,
        })


class CurrentUserView(APIView):
    """Return the identity and BudgetBuddy role of the authenticated user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.pk,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "role_display": user.get_role_display(),
        })


class AdminUserListView(APIView):
    """List account details for the Admin user-management screen."""

    permission_classes = [IsBudgetBuddyAdmin]

    def get(self, request):
        users = User.objects.order_by("username").values(
            "id", "username", "email", "role", "is_active"
        )
        return Response(list(users))


class AdminUserRoleUpdateView(APIView):
    """Allow Admins to assign Student or Premium roles to other users."""

    permission_classes = [IsBudgetBuddyAdmin]

    def patch(self, request, pk):
        target_user = get_object_or_404(User, pk=pk)
        requested_role = request.data.get("role")

        allowed_roles = {User.Role.STUDENT, User.Role.PREMIUM}
        if requested_role not in allowed_roles:
            return Response(
                {"role": "Choose either STUDENT or PREMIUM. Admin roles can only be assigned through Django administration."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if target_user.pk == request.user.pk:
            return Response(
                {"detail": "You cannot change your own role through this endpoint."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_user.role = requested_role
        target_user.save(update_fields=["role"])

        return Response({
            "id": target_user.pk,
            "username": target_user.username,
            "email": target_user.email,
            "role": target_user.role,
            "role_display": target_user.get_role_display(),
        })


class ChangePasswordView(APIView):
    """Let a logged-in user change their own password."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"detail": "Password changed successfully."})