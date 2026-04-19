from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


class UserAdmin(BaseUserAdmin):
    ordering = ["id"]
    list_display = ["id", "email", "role", "is_staff", "is_active"]
    search_fields = ["email"]
    list_filter = ["role", "is_staff", "is_active"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Role & Status", {"fields": ("role", "is_active", "is_staff")}),
        ("Permissions", {"fields": ("is_superuser", "groups", "user_permissions")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email",
                "password1",
                "password2",
                "role",
                "is_active",
                "is_staff",
            ),
        }),
    )

    # Using email instead of username
    def get_fieldsets(self, request, obj=None):
        return super().get_fieldsets(request, obj)


admin.site.register(User, UserAdmin)


'''
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


class UserAdmin(BaseUserAdmin):
    ordering = ["id"]
    list_display = ["id", "email", "is_staff", "is_active"]
    search_fields = ["email"]
    list_filter = ["is_staff", "is_active"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Permissions", {"fields": ("is_staff", "is_superuser", "groups", "user_permissions")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "is_staff", "is_active"),
        }),
    )

    # Because we are using email instead of username
    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        return fieldsets


admin.site.register(User, UserAdmin)
'''


'''
from django.contrib import admin
from django.contrib.auth import get_user_model


User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "business_name", "country")
    search_fields = ("username", "email", "business_name")
'''