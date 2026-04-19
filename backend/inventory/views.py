from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from users.permissions import RolePermission
from users.utils import business_scope
from .models import Category, Product, Supplier, Purchase
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    SupplierSerializer,
    PurchaseSerializer,
)


# ============================
# CATEGORY VIEWSET
# ============================

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, RolePermission]
    resource_name = "inventory"

    def get_queryset(self):
        return business_scope(self.request.user, Category.objects).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, business=self.request.user.business)

    def get_object(self):
        obj = super().get_object()
        if obj.owner != self.request.user:
            raise PermissionDenied("You do not have permission to access this category.")
        return obj


# ============================
# PRODUCT VIEWSET
# ============================

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, RolePermission]
    resource_name = "inventory"

    def get_queryset(self):
        return business_scope(self.request.user, Product.objects).order_by("-updated_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, business=self.request.user.business)

    def get_object(self):
        obj = super().get_object()
        if obj.owner != self.request.user:
            raise PermissionDenied("You do not have permission to access this product.")
        return obj

    @action(detail=False, methods=["get"], url_path="low-stock")
    def low_stock(self, request):
        try:
            threshold = int(request.query_params.get("threshold", 10))
        except (ValueError, TypeError):
            threshold = 10
        qs = business_scope(request.user, Product.objects).filter(
            stock__lte=threshold,
            is_active=True,
        ).order_by("stock")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


# ============================
# SUPPLIER VIEWSET
# ============================

class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated, RolePermission]
    resource_name = "purchases"

    def get_queryset(self):
        return business_scope(self.request.user, Supplier.objects).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, business=self.request.user.business)

    def get_object(self):
        obj = super().get_object()
        if obj.owner != self.request.user:
            raise PermissionDenied("You do not have permission to access this supplier.")
        return obj


# ============================
# PURCHASE VIEWSET
# ============================

class PurchaseViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated, RolePermission]
    resource_name = "purchases"

    def get_queryset(self):
        return business_scope(self.request.user, Purchase.objects).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, business=self.request.user.business)

    def get_object(self):
        obj = super().get_object()
        if obj.owner != self.request.user:
            raise PermissionDenied("You do not have permission to access this purchase.")
        return obj




