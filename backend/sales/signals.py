from django.db.models.signals import post_save
from django.dispatch import receiver

from audit.models import AuditLog
from .models import Sale


@receiver(post_save, sender=Sale)
def log_sale_creation(sender, instance, created, **kwargs):
    if created:
        AuditLog.objects.create(
            user=instance.owner,
            action="CREATE",
            entity="Sale",
            entity_id=instance.id,
            description=f"Sale created with total {instance.total_amount}",
        )
