from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from inventory.models import Product
from sales.models import Sale, SaleItem

User = get_user_model()

SALES_URL = "/api/sales/"


def make_user(email="owner@test.com", role="OWNER"):
    return User.objects.create_user(email=email, password="pass", role=role)


def make_product(owner, name="Widget", stock=10, price="5.00"):
    return Product.objects.create(owner=owner, name=name, stock=stock, price=Decimal(price))


class SalesFlowTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = make_user()
        self.client.force_authenticate(user=self.owner)
        self.product = make_product(self.owner, stock=10, price="5.00")

    def _post_sale(self, items, total, payment="cash"):
        payload = {
            "items": items,
            "total_amount": str(total),
            "payment_method": payment,
        }
        return self.client.post(SALES_URL, payload, format="json")

    def test_create_sale_returns_201(self):
        total = Decimal("5.00") * 2
        response = self._post_sale(
            [{"product": self.product.id, "quantity": 2}], total=total
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_stock_decreases_after_sale(self):
        total = Decimal("5.00") * 3
        self._post_sale([{"product": self.product.id, "quantity": 3}], total=total)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 7)

    def test_sale_items_created(self):
        total = Decimal("5.00") * 2
        resp = self._post_sale([{"product": self.product.id, "quantity": 2}], total=total)
        sale = Sale.objects.get(id=resp.data["id"])
        self.assertEqual(sale.items.count(), 1)
        item = sale.items.first()
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.subtotal, Decimal("10.00"))

    def test_sale_total_amount_matches_computed(self):
        total = Decimal("5.00") * 4
        resp = self._post_sale([{"product": self.product.id, "quantity": 4}], total=total)
        sale = Sale.objects.get(id=resp.data["id"])
        self.assertEqual(sale.total_amount, Decimal("20.00"))

    def test_multi_item_sale(self):
        product2 = make_product(self.owner, name="Gadget", stock=5, price="10.00")
        total = Decimal("5.00") * 2 + Decimal("10.00") * 1
        resp = self._post_sale(
            [
                {"product": self.product.id, "quantity": 2},
                {"product": product2.id, "quantity": 1},
            ],
            total=total,
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        product2.refresh_from_db()
        self.assertEqual(self.product.stock, 8)
        self.assertEqual(product2.stock, 4)

    def test_payment_method_stored(self):
        total = Decimal("5.00")
        resp = self._post_sale(
            [{"product": self.product.id, "quantity": 1}], total=total, payment="transfer"
        )
        sale = Sale.objects.get(id=resp.data["id"])
        self.assertEqual(sale.payment_method, "transfer")


class NegativeStockPreventionTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = make_user(email="owner2@test.com")
        self.client.force_authenticate(user=self.owner)

    def test_cannot_sell_more_than_stock(self):
        product = make_product(self.owner, stock=3, price="5.00")
        total = Decimal("5.00") * 5
        resp = self.client.post(
            SALES_URL,
            {"items": [{"product": product.id, "quantity": 5}], "total_amount": str(total)},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        product.refresh_from_db()
        self.assertEqual(product.stock, 3)

    def test_cannot_sell_from_zero_stock(self):
        product = make_product(self.owner, stock=0, price="5.00")
        resp = self.client.post(
            SALES_URL,
            {"items": [{"product": product.id, "quantity": 1}], "total_amount": "5.00"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        product.refresh_from_db()
        self.assertEqual(product.stock, 0)

    def test_empty_items_rejected(self):
        resp = self.client.post(
            SALES_URL,
            {"items": [], "total_amount": "0.00"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_total_mismatch_rejected(self):
        product = make_product(self.owner, stock=5, price="5.00")
        resp = self.client.post(
            SALES_URL,
            {"items": [{"product": product.id, "quantity": 1}], "total_amount": "999.00"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        product.refresh_from_db()
        self.assertEqual(product.stock, 5)

    def test_cannot_sell_product_owned_by_another_user(self):
        other = make_user(email="other@test.com")
        foreign_product = make_product(other, name="ForeignWidget", stock=10)
        resp = self.client.post(
            SALES_URL,
            {"items": [{"product": foreign_product.id, "quantity": 1}], "total_amount": "5.00"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        foreign_product.refresh_from_db()
        self.assertEqual(foreign_product.stock, 10)
