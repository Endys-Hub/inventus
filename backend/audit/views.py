from rest_framework import generics, permissions

from users.permissions import RolePermission
from .models import AuditLog
from .serializers import AuditLogSerializer


# ============================
# AUDIT LOG LIST
# ============================

class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, RolePermission]
    resource_name = "audit"

    def get_queryset(self):
        return AuditLog.objects.all()


'''
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role not in ["OWNER", "MANAGER"]:
            raise PermissionDenied("You do not have access to audit logs.")

        return AuditLog.objects.all()
'''
