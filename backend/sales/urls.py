from django.urls import path
from .views import SaleListCreateView, DashboardMetricsView, SalesSummaryView

urlpatterns = [
    path("dashboard/", DashboardMetricsView.as_view()),
    path("summary/", SalesSummaryView.as_view()),
    path("", SaleListCreateView.as_view()),
]
