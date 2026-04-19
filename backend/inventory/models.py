from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


# ============================
# CATEGORY MODEL
# ============================
class Category(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories"
    )
    business = models.ForeignKey(
        "users.Business",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="categories",
    )
    name = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("owner", "name")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.owner.email})"


# ============================
# PRODUCT MODEL
# ============================
class Product(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="products"
    )
    business = models.ForeignKey(
        "users.Business",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="products",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products"
    )
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True)
    stock = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("owner", "name")
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.name} - {self.owner.email}"


# ============================
# SUPPLIER MODEL
# ============================
class Supplier(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="suppliers"
    )
    business = models.ForeignKey(
        "users.Business",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="suppliers",
    )
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=150, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("owner", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name}"


# ============================
# PURCHASE MODEL
# ============================
class Purchase(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="purchases"
    )
    business = models.ForeignKey(
        "users.Business",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="purchases",
    )
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        null=True,
        related_name="purchases"
    )
    invoice_number = models.CharField(max_length=100, blank=True, null=True)

    date = models.DateField()
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00")
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Purchase #{self.id} from {self.supplier}"


# ============================
# PURCHASE ITEM MODEL
# ============================
class PurchaseItem(models.Model):
    purchase = models.ForeignKey(
        Purchase,
        on_delete=models.CASCADE,
        related_name="items"
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2)

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00")
    )

    def save(self, *args, **kwargs):
        # auto-calc subtotal
        self.subtotal = Decimal(self.quantity) * self.cost_price
        super().save(*args, **kwargs)

        # update stock
        self.product.stock = self.product.stock + self.quantity
        self.product.save(update_fields=["stock"])

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

'''
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class Category(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("owner", "name")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.owner.email})"


class Product(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True)
    stock = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), validators=[MinValueValidator(Decimal("0.00"))])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("owner", "name")
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.name} - {self.owner.email}"
'''