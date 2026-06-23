from celery import shared_task
from django.utils import timezone
from datetime import timedelta


@shared_task(bind=True, max_retries=3)
def geocodificar_localizacao(self, localizacao_id: int):
    """Fills lat/lng for a Localizacao record via Google Maps Geocoding API."""
    from negocios.models import Localizacao
    from negocios.services import geocodificar_endereco

    try:
        loc = Localizacao.objects.select_related("negocio").get(pk=localizacao_id)
        if loc.lat and loc.lng:
            return "already geocoded"

        endereco = loc.get_direccao_fmt()
        if not endereco:
            return "no address"

        resultado = geocodificar_endereco(f"{endereco}, SC, Brasil")
        if resultado:
            lat, lng = resultado
            Localizacao.objects.filter(pk=localizacao_id).update(lat=lat, lng=lng)
            return f"geocoded: {lat}, {lng}"

        return "geocoding returned no results"
    except Localizacao.DoesNotExist:
        return "not found"
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


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
