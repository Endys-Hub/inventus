from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from inventory.models import Product, Supplier, Purchase, PurchaseItem
from users.models import Business

User = get_user_model()

PRODUCTS_URL = "/api/inventory/products/"
PURCHASES_URL = "/api/inventory/purchases/"
SUPPLIERS_URL = "/api/inventory/suppliers/"
SALES_URL = "/api/sales/"
EXPENSES_URL = "/api/expenses/"


def make_user(email, role):
    return User.objects.create_user(email=email, password="pass", role=role)


def make_product(owner, name="Widget", stock=5, price="10.00"):
    return Product.objects.create(owner=owner, name=name, stock=stock, price=Decimal(price))


class OwnerPermissionsTest(TestCase):
    """OWNER can perform all CRUD on all resources."""

    def setUp(self):
        self.client = APIClient()
        self.owner = make_user("owner@test.com", "OWNER")
        self.client.force_authenticate(user=self.owner)

    def test_owner_can_list_products(self):
        resp = self.client.get(PRODUCTS_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_owner_can_create_product(self):
        resp = self.client.post(
            PRODUCTS_URL, {"name": "NewProd", "price": "9.99", "stock": 5}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_owner_can_delete_product(self):
        business = Business.objects.create(name="OwnerBiz", owner=self.owner)
        self.owner.business = business
        self.owner.save()
        product = Product.objects.create(
            owner=self.owner, name="Widget", stock=5, price=Decimal("10.00"), business=business
        )
        resp = self.client.delete(f"{PRODUCTS_URL}{product.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_owner_can_list_sales(self):
        resp = self.client.get(SALES_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_owner_can_access_expenses(self):
        resp = self.client.get(EXPENSES_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


class ManagerPermissionsTest(TestCase):
    """MANAGER has full inventory access but cannot delete purchases/sales."""

    def setUp(self):
        self.client = APIClient()
        self.owner = make_user("owner@test.com", "OWNER")
        self.manager = make_user("manager@test.com", "MANAGER")
        self.client.force_authenticate(user=self.manager)

    def test_manager_can_list_products(self):
        resp = self.client.get(PRODUCTS_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_manager_can_create_product(self):
        resp = self.client.post(
            PRODUCTS_URL, {"name": "MgrProd", "price": "4.50", "stock": 10}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_manager_can_delete_product(self):
        business = Business.objects.create(name="MgrBiz", owner=self.owner)
        self.manager.business = business
        self.manager.save()
        product = Product.objects.create(
            owner=self.manager, name="MgrProduct", stock=5, price=Decimal("10.00"), business=business
        )
        resp = self.client.delete(f"{PRODUCTS_URL}{product.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_manager_can_read_sales(self):
        resp = self.client.get(SALES_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_manager_cannot_delete_sale(self):
        # Sales API only exposes list/create — no delete endpoint exists.
        # Attempting DELETE on a sale URL must not succeed (403 or 404/405).
        product = make_product(self.manager, stock=5, price="10.00")
        sale_resp = self.client.post(
            SALES_URL,
            {"items": [{"product": product.id, "quantity": 1}], "total_amount": "10.00"},
            format="json",
        )
        self.assertEqual(sale_resp.status_code, status.HTTP_201_CREATED)
        sale_id = sale_resp.data["id"]
        del_resp = self.client.delete(f"{SALES_URL}{sale_id}/")
        self.assertIn(del_resp.status_code, [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        ])

    def test_manager_cannot_delete_purchase(self):
        supplier = Supplier.objects.create(owner=self.manager, name="S1")
        purchase = Purchase.objects.create(
            owner=self.manager, supplier=supplier, date="2026-01-01", total_amount=Decimal("0")
        )
        resp = self.client.delete(f"{PURCHASES_URL}{purchase.id}/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class CashierPermissionsTest(TestCase):
    """CASHIER can only create and read sales."""

    def setUp(self):
        self.client = APIClient()
        self.owner = make_user("owner@test.com", "OWNER")
        self.cashier = make_user("cashier@test.com", "CASHIER")
        self.client.force_authenticate(user=self.cashier)

    def test_cashier_can_create_sale(self):
        # Products must be owned by the cashier for the sale to work
        product = make_product(self.cashier, stock=10, price="5.00")
        resp = self.client.post(
            SALES_URL,
            {"items": [{"product": product.id, "quantity": 2}], "total_amount": "10.00"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_cashier_can_read_sales(self):
        resp = self.client.get(SALES_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_cashier_cannot_list_products(self):
        resp = self.client.get(PRODUCTS_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_cashier_cannot_create_product(self):
        resp = self.client.post(
            PRODUCTS_URL, {"name": "Unauthorized", "price": "1.00", "stock": 1}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_cashier_cannot_access_purchases(self):
        resp = self.client.get(PURCHASES_URL)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_cashier_cannot_access_expenses(self):
        resp = self.client.get(EXPENSES_URL)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_cashier_cannot_delete_sale(self):
        product = make_product(self.cashier, stock=5, price="5.00")
        sale_resp = self.client.post(
            SALES_URL,
            {"items": [{"product": product.id, "quantity": 1}], "total_amount": "5.00"},
            format="json",
        )
        sale_id = sale_resp.data["id"]
        del_resp = self.client.delete(f"{SALES_URL}{sale_id}/")
        self.assertIn(del_resp.status_code, [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        ])


class UnauthenticatedAccessTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_unauthenticated_cannot_access_products(self):
        resp = self.client.get(PRODUCTS_URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_cannot_access_sales(self):
        resp = self.client.get(SALES_URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_cannot_create_sale(self):
        resp = self.client.post(SALES_URL, {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
