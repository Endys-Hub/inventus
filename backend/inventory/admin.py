from django.contrib import admin
from .models import Category, Product, Supplier, Purchase, PurchaseItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "created_at")
    list_filter = ("owner",)
    search_fields = ("name", "owner__email")

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "category", "stock", "price", "is_active", "updated_at")
    list_filter = ("owner", "is_active", "category")
    search_fields = ("name", "sku", "owner__email")

# ---------------------------
# SUPPLIERS
# ---------------------------
@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "phone", "owner", "created_at")
    search_fields = ("name", "email", "phone")
    list_filter = ("owner",)

# ---------------------------
# PURCHASE ITEMS INLINE
# ---------------------------
class PurchaseItemInline(admin.TabularInline):
    model = PurchaseItem
    extra = 0
    readonly_fields = ()  # OK now

# ---------------------------
# PURCHASES ADMIN
# ---------------------------
@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ("id", "supplier", "owner", "total_amount", "date", "created_at")  # FIXED here
    list_filter = ("owner", "supplier")
    search_fields = ("supplier__name",)
    inlines = [PurchaseItemInline]




'''
from django.contrib import admin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "created_at")
    list_filter = ("owner",)
    search_fields = ("name", "owner__email")

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "category", "stock", "price", "is_active", "updated_at")
    list_filter = ("owner", "is_active", "category")
    search_fields = ("name", "sku", "owner__email")
'''