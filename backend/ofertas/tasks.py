from celery import shared_task
from django.utils import timezone


@shared_task
def expirar_ofertas():
    """Marca como expiradas as ofertas cujo prazo de 7 dias venceu. Roda a cada hora via Beat."""
    from .models import Oferta
    atualizadas = Oferta.objects.filter(
        status=Oferta.Status.ATIVA,
        expira_em__lte=timezone.now(),
    ).update(status=Oferta.Status.EXPIRADA)
    return f"{atualizadas} ofertas expiradas"
