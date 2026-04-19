from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password as django_validate_password
from rest_framework import serializers
from .models import Business, User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    business_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password", "business_name"]

    def validate_password(self, value):
        django_validate_password(value)
        return value

    def create(self, validated_data):
        business_name = validated_data.pop("business_name")
        user = User.objects.create_user(**validated_data)
        business = Business.objects.create(name=business_name, owner=user)
        user.business = business
        user.role = "OWNER"
        user.save(update_fields=["business", "role"])
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            email=attrs.get("email"),
            password=attrs.get("password"),
        )

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source="business.name", read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "role", "business_name"]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        django_validate_password(value)
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs
