from django.contrib import admin
from .models import Expense

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "category", "amount", "date", "created_at")
    list_filter = ("category", "date", "created_at")
    search_fields = ("description", "category")
    ordering = ("-date",)

