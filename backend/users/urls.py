from django.urls import path
from .views import RegisterView, LoginView, RefreshView, LogoutView, MeView, CSRFView, ChangePasswordView
from .views_password_reset import RequestPasswordResetView, ConfirmPasswordResetView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", RefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("csrf/", CSRFView.as_view(), name="csrf"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("password-reset/", RequestPasswordResetView.as_view(), name="password_reset"),
    path("password-reset-confirm/", ConfirmPasswordResetView.as_view(), name="password_reset_confirm"),
]
