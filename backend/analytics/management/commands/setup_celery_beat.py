from django.core.management.base import BaseCommand
from django_celery_beat.models import CrontabSchedule, PeriodicTask


class Command(BaseCommand):
    help = "Cria os agendamentos do Celery Beat do DescubraSul."

    def handle(self, *args, **options):
        # 00:30 — agrega cliques do dia anterior em MetricaDiaria
        cron_0030, _ = CrontabSchedule.objects.get_or_create(
            minute="30", hour="0",
            day_of_week="*", day_of_month="*", month_of_year="*",
            timezone="America/Sao_Paulo",
        )
        task, created = PeriodicTask.objects.get_or_create(
            name="Agregar metricas diarias",
            defaults={
                "crontab": cron_0030,
                "task":    "analytics.tasks.agregar_metricas_diarias",
            },
        )
        self._log("Agregacao de metricas (00:30 diario)", created)

        # 02:00 — oculta produtos sem confirmacao ha mais de 30 dias
        cron_0200, _ = CrontabSchedule.objects.get_or_create(
            minute="0", hour="2",
            day_of_week="*", day_of_month="*", month_of_year="*",
            timezone="America/Sao_Paulo",
        )
        task, created = PeriodicTask.objects.get_or_create(
            name="Ocultar produtos vencidos",
            defaults={
                "crontab": cron_0200,
                "task":    "negocios.tasks.ocultar_produtos_vencidos",
            },
        )
        self._log("Ocultar produtos vencidos (02:00 diario)", created)

        # 03:00 todo domingo — remove cliques crus com mais de 90 dias
        cron_0300_dom, _ = CrontabSchedule.objects.get_or_create(
            minute="0", hour="3",
            day_of_week="0", day_of_month="*", month_of_year="*",
            timezone="America/Sao_Paulo",
        )
        task, created = PeriodicTask.objects.get_or_create(
            name="Purgar cliques antigos",
            defaults={
                "crontab": cron_0300_dom,
                "task":    "analytics.tasks.purgar_cliques_antigos",
            },
        )
        self._log("Purga de cliques antigos (03:00 domingo)", created)

    def _log(self, nome, created):
        status = "criada" if created else "ja existia"
        self.stdout.write(self.style.SUCCESS(f"[{status}] {nome}"))
