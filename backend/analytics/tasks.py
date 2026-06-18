from celery import shared_task
from django.db.models import Count, Q
from django.utils import timezone
from datetime import date, timedelta


@shared_task(bind=True, max_retries=3)
def agregar_metricas_diarias(self, dia=None):
    """
    Agrega os cliques crus do dia anterior em MetricaDiaria.
    Roda todo dia as 00:30h via Celery Beat.

    Pode receber uma data especifica (YYYY-MM-DD) para reprocessar.
    """
    from analytics.models import Clique, MetricaDiaria
    from negocios.models import Negocio

    try:
        if dia:
            alvo = date.fromisoformat(dia)
        else:
            alvo = date.today() - timedelta(days=1)

        negocios_com_cliques = (
            Clique.objects
            .filter(criado_em__date=alvo)
            .values_list("negocio_id", flat=True)
            .distinct()
        )

        processados = 0
        for negocio_id in negocios_com_cliques:
            cliques = Clique.objects.filter(
                negocio_id=negocio_id,
                criado_em__date=alvo,
            )

            agregado = cliques.aggregate(
                total_views=Count("id", filter=Q(tipo="view")),
                total_produto=Count("id", filter=Q(tipo="produto")),
                total_whatsapp=Count("id", filter=Q(tipo="whatsapp")),
                total_shares=Count("id", filter=Q(tipo="share")),
                origem_google=Count("id", filter=Q(origem="google")),
                origem_instagram=Count("id", filter=Q(origem="instagram")),
                origem_facebook=Count("id", filter=Q(origem="facebook")),
                origem_whatsapp=Count("id", filter=Q(origem="whatsapp")),
                origem_direto=Count("id", filter=Q(origem="direto")),
                cliques_instagram=Count("id", filter=Q(tipo="instagram")),
                cliques_tiktok=Count("id", filter=Q(tipo="tiktok")),
                cliques_facebook=Count("id", filter=Q(tipo="facebook")),
                cliques_youtube=Count("id", filter=Q(tipo="youtube")),
                cliques_maps=Count("id", filter=Q(tipo="maps")),
            )

            views = agregado["total_views"] or 0
            whats = agregado["total_whatsapp"] or 0
            agregado["taxa_conversao"] = round((whats / views) * 100, 2) if views else 0

            MetricaDiaria.objects.update_or_create(
                negocio_id=negocio_id,
                data=alvo,
                defaults=agregado,
            )
            processados += 1

        return f"{alvo}: {processados} negocio(s) processado(s)"

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def purgar_cliques_antigos(self, dias=90):
    """
    Remove cliques crus com mais de 90 dias — ja foram agregados em MetricaDiaria.
    Roda toda semana (domingo) as 03:00h via Celery Beat.
    """
    from analytics.models import Clique

    try:
        limite = timezone.now() - timedelta(days=dias)
        total, _ = Clique.objects.filter(criado_em__lt=limite).delete()
        return f"{total} clique(s) removido(s)"
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
