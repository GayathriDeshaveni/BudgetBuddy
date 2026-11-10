from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    AdminUserListView,
    AdminUserRoleUpdateView,
    ChangePasswordView,
    CurrentUserView,
    ProtectedTestView,
    RegisterView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("protected-test/", ProtectedTestView.as_view(), name="protected_test"),
    path("me/", CurrentUserView.as_view(), name="current_user"),
    path("admin/users/", AdminUserListView.as_view(), name="admin_user_list"),
    path(
        "admin/users/<int:pk>/role/",
        AdminUserRoleUpdateView.as_view(),
        name="admin_user_role_update",
    ),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
]
