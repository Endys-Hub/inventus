from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.conf import settings

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, ChangePasswordSerializer


def _set_refresh_cookie(response, refresh_token_str):
    """Attach the refresh token as an httpOnly cookie to the response."""
    response.set_cookie(
        key=settings.AUTH_COOKIE,
        value=refresh_token_str,
        max_age=settings.AUTH_COOKIE_MAX_AGE,
        httponly=settings.AUTH_COOKIE_HTTP_ONLY,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path=settings.AUTH_COOKIE_PATH,
    )


def _delete_refresh_cookie(response):
    """Remove the refresh token cookie."""
    response.delete_cookie(
        key=settings.AUTH_COOKIE,
        path=settings.AUTH_COOKIE_PATH,
    )


@method_decorator(csrf_exempt, name="dispatch")
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        response = Response(
            {
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )
        _set_refresh_cookie(response, str(refresh))
        return response


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)

        response = Response(
            {
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )
        _set_refresh_cookie(response, str(refresh))
        return response


@method_decorator(csrf_exempt, name="dispatch")
class RefreshView(APIView):
    """
    Issues a new access token from the httpOnly refresh-token cookie.
    If ROTATE_REFRESH_TOKENS is True, also rotates the cookie.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token_str = request.COOKIES.get(settings.AUTH_COOKIE)
        if not refresh_token_str:
            return Response(
                {"detail": "Refresh token not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(refresh_token_str)
            new_access = str(refresh.access_token)

            response = Response({"access": new_access}, status=status.HTTP_200_OK)

            # When rotation is enabled SimpleJWT generates a new refresh token
            # when we call refresh.access_token — update the cookie too.
            if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS", False):
                _set_refresh_cookie(response, str(refresh))

            return response

        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )


@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(APIView):
    """
    Blacklists the refresh token and clears the cookie.
    Works even when the access token has already expired.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token_str = request.COOKIES.get(settings.AUTH_COOKIE)
        if refresh_token_str:
            try:
                token = RefreshToken(refresh_token_str)
                token.blacklist()
            except TokenError:
                pass  # Already invalid or blacklisted — that's fine

        response = Response({"detail": "Logged out."}, status=status.HTTP_200_OK)
        _delete_refresh_cookie(response)
        return response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["current_password"]):
            return Response(
                {"current_password": "Incorrect password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CSRFView(APIView):
    """
    GET /api/auth/csrf/

    A no-op endpoint whose only job is to trigger Django's CSRF middleware so
    it writes the csrftoken cookie into the browser.  Call this once on app
    startup (before any state-changing request) so the frontend always has a
    token to read via document.cookie.

    Requires CSRF_COOKIE_HTTPONLY = False in settings so JS can read the cookie.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"detail": "CSRF cookie set."}, status=status.HTTP_200_OK)





