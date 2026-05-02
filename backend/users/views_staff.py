from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated

from .models import User


class StaffCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=["MANAGER", "CASHIER"])

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class StaffView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "OWNER":
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        staff = User.objects.filter(
            business=request.user.business,
        ).exclude(role="OWNER").values("id", "email", "role")

        return Response(list(staff), status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != "OWNER":
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        serializer = StaffCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        user = User.objects.create_user(
            email=data["email"],
            password=data["password"],
            role=data["role"],
            business=request.user.business,
        )

        return Response({"email": user.email, "role": user.role}, status=status.HTTP_201_CREATED)
