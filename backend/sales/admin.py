from django.contrib import admin
from .models import Sale, SaleItem

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ("id", "owner", "total_amount", "created_at")
    list_filter = ("owner", "created_at")
    search_fields = ("owner__username",)

@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ("id", "sale", "product", "quantity", "price", "subtotal")
    search_fields = ("product__name",)
