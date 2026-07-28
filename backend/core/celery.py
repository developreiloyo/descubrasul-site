import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.dev")

app = Celery("descubrasul")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    # Agrega cliques do dia anterior — todo dia às 00:30h (horário de Brasília)
    "agregar-metricas-diarias": {
        "task": "analytics.tasks.agregar_metricas_diarias",
        "schedule": crontab(hour=0, minute=30),
    },
    # Oculta produtos sem confirmação há mais de 30 dias — todo dia às 02:00h
    "ocultar-produtos-vencidos": {
        "task": "negocios.tasks.ocultar_produtos_vencidos",
        "schedule": crontab(hour=2, minute=0),
    },
    # Remove cliques crus com mais de 90 dias — todo domingo às 03:00h
    "purgar-cliques-antigos": {
        "task": "analytics.tasks.purgar_cliques_antigos",
        "schedule": crontab(hour=3, minute=0, day_of_week=0),
    },
    # Rebaixa para gratuito assinaturas canceladas/pausadas há mais de 7 dias
    "verificar-assinaturas-vencidas": {
        "task": "planos.tasks.verificar_assinaturas_vencidas",
        "schedule": crontab(hour=1, minute=0),
    },
    # Sincroniza produtos Pro/Produção com Google Merchant Center — todo dia às 04:00h
    "sincronizar-feed-gmc": {
        "task": "merchant.tasks.sincronizar_feed_gmc",
        "schedule": crontab(hour=4, minute=0),
    },
}
