from datetime import timedelta

from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from expenses.models import Expense
from users.permissions import RolePermission
from users.utils import business_scope
from .models import Sale
from .serializers import SaleCreateSerializer, SaleReadSerializer


# ============================
# DASHBOARD METRICS
# ============================

class DashboardMetricsView(APIView):
    permission_classes = [IsAuthenticated, RolePermission]
    resource_name = "reports"

    def get(self, request):
        period = request.query_params.get("period", "month")
        today = timezone.localdate()

        if period == "today":
            start_date = today
        elif period == "week":
            start_date = today - timedelta(days=6)
        else:
            start_date = today - timedelta(days=29)

        sales_qs = business_scope(request.user, Sale.objects).filter(created_at__date__gte=start_date)
        expenses_qs = business_scope(request.user, Expense.objects).filter(date__gte=start_date)

        sales_agg = sales_qs.aggregate(
            total_sales=Count("id"),
            revenue=Sum("total_amount"),
        )
        expenses_agg = expenses_qs.aggregate(total_expenses=Sum("amount"))

        revenue = float(sales_agg["revenue"] or 0)
        expenses = float(expenses_agg["total_expenses"] or 0)

        daily_sales = (
            sales_qs
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(sales=Count("id"), revenue=Sum("total_amount"))
            .order_by("day")
        )

        daily_expenses = (
            expenses_qs
            .values("date")
            .annotate(expenses=Sum("amount"))
            .order_by("date")
        )

        expense_map = {str(row["date"]): float(row["expenses"]) for row in daily_expenses}

        chart_data = [
            {
                "date": str(row["day"]),
                "sales": row["sales"],
                "revenue": float(row["revenue"]),
                "expenses": expense_map.get(str(row["day"]), 0),
            }
            for row in daily_sales
        ]

        return Response({
            "period": period,
            "total_sales": sales_agg["total_sales"] or 0,
            "revenue": revenue,
            "expenses": expenses,
            "profit": revenue - expenses,
            "chart_data": chart_data,
        })


# ============================
# SALE LIST & CREATE
# ============================

class SaleListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, RolePermission]
    resource_name = "sales"

    def get_queryset(self):
        return business_scope(self.request.user, Sale.objects).order_by("-created_at")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return SaleCreateSerializer
        return SaleReadSerializer

    def create(self, request, *args, **kwargs):
        write_serializer = SaleCreateSerializer(data=request.data, context={"request": request})
        write_serializer.is_valid(raise_exception=True)
        sale = write_serializer.save()
        read_serializer = SaleReadSerializer(sale)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)


# ============================
# SALES SUMMARY
# ============================

class SalesSummaryView(APIView):
    permission_classes = [IsAuthenticated, RolePermission]
    resource_name = "sales"

    def get(self, request):
        today = timezone.localdate()
        month_start = today.replace(day=1)

        qs = business_scope(request.user, Sale.objects)

        date_filter = request.query_params.get("date")
        if date_filter:
            qs = qs.filter(created_at__date=date_filter)

        agg = qs.aggregate(total_transactions=Count("id"), total_sales=Sum("total_amount"))
        total = float(agg["total_sales"] or 0)
        count = agg["total_transactions"] or 0
        avg = round(total / count, 2) if count else 0

        breakdown = {"cash": 0.0, "pos": 0.0, "transfer": 0.0}
        for row in qs.values("payment_method").annotate(amt=Sum("total_amount")):
            method = (row["payment_method"] or "").lower()
            val = float(row["amt"] or 0)
            if method in breakdown:
                breakdown[method] += val
            else:
                breakdown["cash"] += val

        today_total = float(
            business_scope(request.user, Sale.objects).filter(created_at__date=today)
            .aggregate(t=Sum("total_amount"))["t"] or 0
        )
        month_total = float(
            business_scope(request.user, Sale.objects).filter(created_at__date__gte=month_start)
            .aggregate(t=Sum("total_amount"))["t"] or 0
        )

        sales = SaleReadSerializer(qs.order_by("-created_at")[:50], many=True).data

        return Response({
            "totalSales": total,
            "totalTransactions": count,
            "averageSale": avg,
            "paymentBreakdown": breakdown,
            "sales": sales,
            "today_total": today_total,
            "month_total": month_total,
        })


