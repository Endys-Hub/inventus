from django.db.models.signals import post_save
from django.dispatch import receiver

from audit.models import AuditLog
from .models import Purchase


@receiver(post_save, sender=Purchase)
def log_purchase_creation(sender, instance, created, **kwargs):
    if created:
        AuditLog.objects.create(
            user=instance.owner,
            action="CREATE",
            entity="Purchase",
            entity_id=instance.id,
            description=f"Purchase created. Total cost: {instance.total_amount}",
        )
