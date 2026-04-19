from rest_framework.permissions import BasePermission, SAFE_METHODS


class RolePermission(BasePermission):
    """Central RBAC permission class. Attach to any view via permission_classes."""

    ROLE_PERMISSIONS = {
        "OWNER": {
            "inventory": ["create", "read", "update", "delete"],
            "sales": ["create", "read", "update", "delete"],
            "expenses": ["create", "read", "update", "delete"],
            "purchases": ["create", "read", "update", "delete"],
            "reports": ["read"],
            "users": ["create", "read", "update", "delete"],
        },
        "MANAGER": {
            "inventory": ["create", "read", "update", "delete"],
            "sales": ["create", "read"],
            "expenses": ["create", "read", "update", "delete"],
            "purchases": ["create", "read", "update"],
            "reports": ["read"],
        },
        "CASHIER": {
            "inventory": ["read"],
            "sales": ["create", "read"],
        },
    }

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = str(getattr(request.user, "role", "") or "").upper()
        resource = getattr(view, "resource_name", None)

        if role not in self.ROLE_PERMISSIONS or not resource:
            return False

        if request.method in SAFE_METHODS:
            action = "read"
        elif request.method == "POST":
            action = "create"
        elif request.method in ["PUT", "PATCH"]:
            action = "update"
        elif request.method == "DELETE":
            action = "delete"
        else:
            return False

        return action in self.ROLE_PERMISSIONS[role].get(resource, [])
