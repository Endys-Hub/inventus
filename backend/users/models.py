from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = (
        ("OWNER", "Owner"),
        ("MANAGER", "Manager"),
        ("CASHIER", "Cashier"),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="CASHIER")  # 👈 ADDED
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    business = models.ForeignKey(
        "Business",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="members",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


class Business(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="owned_businesses",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name



'''
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"   # 👈 Login with email instead of username
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email
'''



'''
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
# Extend here as needed for the business (phone, country, business_name, etc.)
    phone = models.CharField(max_length=20, blank=True)
    business_name = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=100, blank=True)


    def __str__(self):
        return self.username
'''