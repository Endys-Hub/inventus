from decimal import Decimal
from django.db import transaction
from rest_framework import serializers

from .models import Sale, SaleItem
from inventory.models import Product


class SaleItemWriteSerializer(serializers.Serializer):
    product = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class SaleCreateSerializer(serializers.Serializer):
    items = SaleItemWriteSerializer(many=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_method = serializers.CharField(max_length=32, required=False, allow_blank=True, default="")

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        items = validated_data["items"]

        with transaction.atomic():
            computed_total = Decimal("0.00")
            product_updates = []
            sale_items_data = []

            for it in items:
                pid = it["product"]
                qty = int(it["quantity"])

                # Lock product row to prevent race conditions
                try:
                    product = Product.objects.select_for_update().get(id=pid, owner=user)
                except Product.DoesNotExist:
                    # product not found or not owned by the user
                    raise serializers.ValidationError({"product": f"Product {pid} not found or not available"})

                # adjust field name if your product uses a different stock field
                stock_val = getattr(product, "stock", None)
                if stock_val is None:
                    # fallback common field name
                    stock_val = getattr(product, "quantity", None)

                if stock_val is None:
                    raise serializers.ValidationError({"product": f"Product {product.id} has no stock field configured."})

                if stock_val < qty:
                    raise serializers.ValidationError({"stock": f"Insufficient stock for {product.name}. Available: {stock_val}"})

                price = product.price
                subtotal = (price * qty)
                computed_total += subtotal

                # prepare update
                # reduce stock (adjust attribute name if necessary)
                if hasattr(product, "stock"):
                    product.stock = product.stock - qty
                else:
                    product.quantity = product.quantity - qty

                product_updates.append(product)
                sale_items_data.append({"product": product, "quantity": qty, "price": price, "subtotal": subtotal})

            # Validate total amount (allow small rounding delta)
            provided_total = Decimal(validated_data.get("total_amount"))
            if abs(provided_total - computed_total) > Decimal("0.05"):
                raise serializers.ValidationError({"total_amount": "Total amount mismatch."})

            sale = Sale.objects.create(
                owner=user,
                business=user.business,
                total_amount=computed_total,
                payment_method=validated_data.get("payment_method", ""),
            )

            # create sale items
            for si in sale_items_data:
                SaleItem.objects.create(
                    sale=sale,
                    product=si["product"],
                    quantity=si["quantity"],
                    price=si["price"],
                    subtotal=si["subtotal"],
                )

            # persist stock changes
            for p in product_updates:
                p.save()

            return sale


class SaleItemReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = SaleItem
        fields = ["id", "product", "product_name", "quantity", "price", "subtotal"]


class SaleReadSerializer(serializers.ModelSerializer):
    items = SaleItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = ["id", "owner", "created_at", "total_amount", "payment_method", "items"]
        read_only_fields = ["id", "created_at", "items", "owner"]
