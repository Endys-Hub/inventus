from django.db.models.signals import post_save
from django.dispatch import receiver

from audit.models import AuditLog
from .models import Expense


@receiver(post_save, sender=Expense)
def log_expense_creation(sender, instance, created, **kwargs):
    if created:
        AuditLog.objects.create(
            user=instance.user,
            action="CREATE",
            entity="Expense",
            entity_id=instance.id,
            description=f"Expense logged: {instance.amount} on {instance.category}",
        )
