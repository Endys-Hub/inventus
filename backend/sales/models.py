from decimal import Decimal
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


# NOTE:
# - Adjust the import path below if your Product model lives in another app/file.
# - This assumes your Product model has at least: id, name, stock (or quantity), price, owner
from inventory.models import Product


class Sale(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sales",
    )
    business = models.ForeignKey(
        "users.Business",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="sales",
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    created_at = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=32, blank=True, null=True)  # optional

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Sale #{self.id} - {self.total_amount} by {self.owner}"


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=12, decimal_places=2)   # price at time of sale
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity} (Sale #{self.sale_id})"

