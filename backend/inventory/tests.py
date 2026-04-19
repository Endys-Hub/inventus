from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model

from inventory.models import Category, Product, Supplier, Purchase, PurchaseItem

User = get_user_model()


def make_owner(email="owner@test.com"):
    return User.objects.create_user(email=email, password="pass", role="OWNER")


def make_product(owner, name="Widget", stock=10, price="5.00"):
    return Product.objects.create(owner=owner, name=name, stock=stock, price=Decimal(price))


class StockIncreaseOnPurchaseItemTest(TestCase):
    def setUp(self):
        self.owner = make_owner()
        self.product = make_product(self.owner, stock=0)
        self.supplier = Supplier.objects.create(owner=self.owner, name="Acme")
        self.purchase = Purchase.objects.create(
            owner=self.owner, supplier=self.supplier, date="2026-01-01", total_amount=Decimal("0.00")
        )

    def test_stock_increases_on_purchase_item_save(self):
        PurchaseItem.objects.create(
            purchase=self.purchase, product=self.product, quantity=20, cost_price=Decimal("2.50")
        )
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 20)

    def test_subtotal_calculated_on_save(self):
        item = PurchaseItem.objects.create(
            purchase=self.purchase, product=self.product, quantity=5, cost_price=Decimal("3.00")
        )
        self.assertEqual(item.subtotal, Decimal("15.00"))

    def test_multiple_purchase_items_accumulate_stock(self):
        product2 = make_product(self.owner, name="Gadget", stock=5)
        PurchaseItem.objects.create(
            purchase=self.purchase, product=self.product, quantity=10, cost_price=Decimal("1.00")
        )
        PurchaseItem.objects.create(
            purchase=self.purchase, product=product2, quantity=3, cost_price=Decimal("2.00")
        )
        self.product.refresh_from_db()
        product2.refresh_from_db()
        self.assertEqual(self.product.stock, 10)
        self.assertEqual(product2.stock, 8)

    def test_zero_initial_stock_increases_correctly(self):
        product = make_product(self.owner, name="NewItem", stock=0)
        PurchaseItem.objects.create(
            purchase=self.purchase, product=product, quantity=100, cost_price=Decimal("0.50")
        )
        product.refresh_from_db()
        self.assertEqual(product.stock, 100)
