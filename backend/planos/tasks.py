from datetime import timedelta
import logging

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task
def verificar_assinaturas_vencidas():
    """
    Downgrades businesses whose subscription was cancelled/paused > 7 days ago.
    Grace period of 7 days per Termos de Uso Section 3.
    Runs daily at 01:00h (configured in core/celery.py).
    """
    from .models import Assinatura

    limite = timezone.now() - timedelta(days=7)

    vencidas = (
        Assinatura.objects
        .select_related("negocio")
        .filter(
            status__in=[Assinatura.Status.CANCELADA, Assinatura.Status.PAUSADA],
            cancelado_em__lte=limite,
        )
        .exclude(negocio__plano="gratuito")
    )

    count = 0
    for assinatura in vencidas:
        negocio = assinatura.negocio
        negocio.plano = "gratuito"
        negocio.save(update_fields=["plano"])
        assinatura.status = Assinatura.Status.ENCERRADA
        assinatura.save(update_fields=["status", "atualizado_em"])
        count += 1
        logger.info("Plano rebaixado para gratuito: negocio_id=%s", negocio.pk)

    logger.info("verificar_assinaturas_vencidas: %d negócios rebaixados", count)
    return count
