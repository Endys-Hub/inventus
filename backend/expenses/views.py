from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Sum

from users.permissions import RolePermission
from users.utils import business_scope
from .models import Expense
from .serializers import ExpenseSerializer


# ============================
# EXPENSE LIST & CREATE
# ============================

class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, RolePermission]
    resource_name = "expenses"

    def get_queryset(self):
        queryset = business_scope(self.request.user, Expense.objects)

        # Filters
        category = self.request.query_params.get("category")
        date = self.request.query_params.get("date")

        if category:
            queryset = queryset.filter(category=category)

        if date:
            queryset = queryset.filter(date=date)

        return queryset.order_by("-date")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, business=self.request.user.business)


# ============================
# EXPENSE DETAIL
# ============================

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, RolePermission]
    resource_name = "expenses"

    def get_queryset(self):
        return business_scope(self.request.user, Expense.objects)


# ============================
# EXPENSE SUMMARY
# ============================

class ExpenseSummaryView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, RolePermission]
    resource_name = "expenses"

    def get(self, request):
        queryset = business_scope(request.user, Expense.objects)

        # Filters
        start = request.query_params.get("start_date")
        end = request.query_params.get("end_date")

        if start and end:
            queryset = queryset.filter(date__range=[start, end])

        total = queryset.aggregate(total_expense=Sum("amount"))["total_expense"] or 0

        return Response({
            "total_expense": total,
            "currency": "NGN",
        })



