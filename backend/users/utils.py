def business_scope(user, queryset):
    """Return queryset scoped to the user's business, or empty if no business assigned."""
    if not user.business_id:
        return queryset.none()
    return queryset.filter(business=user.business)
