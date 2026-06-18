from celery import shared_task
from django.utils import timezone
from datetime import timedelta


@shared_task(bind=True, max_retries=3)
def ocultar_produtos_vencidos(self):
    """
    Oculta produtos sem confirmacao de disponibilidade ha mais de 30 dias.
    Roda todo dia as 02:00h via Celery Beat.
    """
    from negocios.models import Produto

    try:
        limite = timezone.now() - timedelta(days=30)
        total = Produto.objects.filter(
            disponivel=True,
            confirmado_em__lt=limite,
        ).update(disponivel=False)
        return f"{total} produto(s) ocultado(s)"
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
