from django.db import migrations

DEFAULT_BUSINESS_NAME = "Default Business"


def backfill_business(apps, schema_editor):
    User = apps.get_model("users", "User")
    Business = apps.get_model("users", "Business")
    Category = apps.get_model("inventory", "Category")
    Product = apps.get_model("inventory", "Product")
    Supplier = apps.get_model("inventory", "Supplier")
    Purchase = apps.get_model("inventory", "Purchase")
    Sale = apps.get_model("sales", "Sale")
    Expense = apps.get_model("expenses", "Expense")

    # Pick the first staff/superuser user, then any user, as the default business owner.
    owner = (
        User.objects.filter(is_superuser=True).order_by("id").first()
        or User.objects.order_by("id").first()
    )

    # No users means no data to backfill.
    if owner is None:
        return

    default_business, _ = Business.objects.get_or_create(
        name=DEFAULT_BUSINESS_NAME,
        defaults={"owner": owner},
    )

    # Assign the default business to users who have none.
    User.objects.filter(business__isnull=True).update(business=default_business)

    # Assign to every other model where business is null.
    for Model in (Category, Product, Supplier, Purchase, Sale, Expense):
        Model.objects.filter(business__isnull=True).update(business=default_business)


def reverse_backfill(apps, schema_editor):
    # Reversal clears the default business assignment but does not delete data.
    Business = apps.get_model("users", "Business")
    User = apps.get_model("users", "User")
    Category = apps.get_model("inventory", "Category")
    Product = apps.get_model("inventory", "Product")
    Supplier = apps.get_model("inventory", "Supplier")
    Purchase = apps.get_model("inventory", "Purchase")
    Sale = apps.get_model("sales", "Sale")
    Expense = apps.get_model("expenses", "Expense")

    default_business = Business.objects.filter(name=DEFAULT_BUSINESS_NAME).first()
    if default_business is None:
        return

    for Model in (User, Category, Product, Supplier, Purchase, Sale, Expense):
        Model.objects.filter(business=default_business).update(business=None)

    default_business.delete()


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0004_business_user_business"),
        ("inventory", "0003_category_business_product_business_purchase_business_and_more"),
        ("sales", "0002_sale_business"),
        ("expenses", "0002_expense_business"),
    ]

    operations = [
        migrations.RunPython(backfill_business, reverse_code=reverse_backfill),
    ]
