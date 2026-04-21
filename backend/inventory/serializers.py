from rest_framework import serializers
from .models import (
    Category,
    Product,
    Supplier,
    Purchase,
    PurchaseItem,
)

# ---------------------------------------
# CATEGORY SERIALIZER (unchanged)
# ---------------------------------------
class CategorySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Category name cannot be blank.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data.setdefault("owner", user)
        validated_data.setdefault("business", user.business)
        return Category.objects.create(**validated_data)


# ---------------------------------------
# PRODUCT SERIALIZER (unchanged)
# ---------------------------------------
class ProductSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.none(), allow_null=True, required=False
    )
    category_detail = CategorySerializer(source="category", read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user and request.user.business_id:
            self.fields["category"].queryset = Category.objects.filter(
                business=request.user.business
            )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "sku",
            "description",
            "category",
            "category_detail",
            "stock",
            "price",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "category_detail"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Product name cannot be blank.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data.setdefault("owner", user)
        validated_data.setdefault("business", user.business)
        category = validated_data.get("category")
        if category and category.owner != validated_data["owner"]:
            raise serializers.ValidationError({"category": "Invalid category."})
        return Product.objects.create(**validated_data)

    def update(self, instance, validated_data):
        category = validated_data.get("category", None)
        if category and category.owner != self.context["request"].user:
            raise serializers.ValidationError({"category": "Invalid category."})
        return super().update(instance, validated_data)


# ============================================================
# SUPPLIER SERIALIZER
# ============================================================
class SupplierSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Supplier
        fields = ["id", "name", "phone", "email", "address", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Supplier name cannot be blank.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data.setdefault("owner", user)
        validated_data.setdefault("business", user.business)
        return Supplier.objects.create(**validated_data)


# ============================================================
# PURCHASE ITEM SERIALIZER (nested inside Purchase)
# ============================================================
class PurchaseItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = PurchaseItem
        fields = [
            "id",
            "product",
            "quantity",
            "cost_price",
            "subtotal",
        ]
        read_only_fields = ["id", "subtotal"]

    def validate(self, attrs):
        user = self.context["request"].user
        product = attrs["product"]

        if product.owner != user:
            raise serializers.ValidationError({"product": "Invalid product."})

        return attrs


# ============================================================
# PURCHASE SERIALIZER (with nested items)
# ============================================================
class PurchaseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    supplier_detail = SupplierSerializer(source="supplier", read_only=True)
    items = PurchaseItemSerializer(many=True)

    class Meta:
        model = Purchase
        fields = [
            "id",
            "supplier",
            "supplier_detail",
            "invoice_number",
            "date",
            "total_amount",
            "items",
            "created_at",
        ]
        read_only_fields = ["id", "total_amount", "created_at", "supplier_detail"]

    def validate(self, attrs):
        supplier = attrs.get("supplier")
        user = self.context["request"].user

        if supplier and supplier.owner != user:
            raise serializers.ValidationError({"supplier": "Invalid supplier."})

        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data.setdefault("owner", user)
        validated_data.setdefault("business", user.business)
        items_data = validated_data.pop("items")

        purchase = Purchase.objects.create(**validated_data)

        # Create purchase items
        total = 0
        for item_data in items_data:
            item = PurchaseItem.objects.create(purchase=purchase, **item_data)
            total += item.subtotal  # subtotal already calculated in model save()

        # Update total
        purchase.total_amount = total
        purchase.save(update_fields=["total_amount"])

        return purchase


'''
from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_name(self, value):
        # ensure name isn't blank
        if not value.strip():
            raise serializers.ValidationError("Category name cannot be blank.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        return Category.objects.create(owner=user, **validated_data)


class ProductSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.none(), allow_null=True, required=False)
    category_detail = CategorySerializer(source="category", read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "sku", "description", "category", "category_detail", "stock", "price", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at", "category_detail"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Product name cannot be blank.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        # ensure category belongs to user (if provided)
        category = validated_data.get("category", None)
        if category and category.owner != user:
            raise serializers.ValidationError({"category": "Invalid category."})
        return Product.objects.create(owner=user, **validated_data)

    def update(self, instance, validated_data):
        # ensure category belongs to user on update as well
        category = validated_data.get("category", None)
        if category and category.owner != self.context["request"].user:
            raise serializers.ValidationError({"category": "Invalid category."})
        return super().update(instance, validated_data)
'''