from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "action", "entity", "entity_id", "created_at")
    list_filter = ("action", "entity", "created_at")
    search_fields = ("entity", "description", "user__email")

