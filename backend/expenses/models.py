from django.db import models
from django.conf import settings

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ("rent", "Rent"),
        ("salary", "Salary"),
        ("utilities", "Utilities"),
        ("fuel", "Fuel"),
        ("stock", "Stock Purchase"),
        ("transport", "Transport"),
        ("misc", "Miscellaneous"),
    ]

    # Correct user reference for custom user model
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    business = models.ForeignKey(
        "users.Business",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="expenses",
    )

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} — ₦{self.amount}"


'''
from django.db import models
from django.contrib.auth.models import User

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ("rent", "Rent"),
        ("salary", "Salary"),
        ("utilities", "Utilities"),
        ("fuel", "Fuel"),
        ("stock", "Stock Purchase"),
        ("transport", "Transport"),
        ("misc", "Miscellaneous"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} — ₦{self.amount}"
'''
