import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")

from .base import *  # noqa: F401,F403

SECRET_KEY = "test-secret-key-not-for-production"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Disable pagination for most tests unless explicitly needed
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_PAGINATION_CLASS": "posapi.pagination.StandardResultsPagination",
    "PAGE_SIZE": 25,
}

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
