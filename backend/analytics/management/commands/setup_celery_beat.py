from django.core.management.base import BaseCommand
from django_celery_beat.models import CrontabSchedule, PeriodicTask


class Command(BaseCommand):
    help = "Cria os agendamentos do Celery Beat do DescubraSul."

    def handle(self, *args, **options):
        # Agregacao diaria as 00:30 (horario de Sao Paulo via CELERY_TIMEZONE)
        cron_0030, _ = CrontabSchedule.objects.get_or_create(
            minute="30",
            hour="0",
            day_of_week="*",
            day_of_month="*",
            month_of_year="*",
            timezone="America/Sao_Paulo",
        )

        task, created = PeriodicTask.objects.get_or_create(
            name="Agregar metricas diarias",
            defaults={
                "crontab": cron_0030,
                "task": "analytics.tasks.agregar_metricas_diarias",
            },
        )

        status = "criada" if created else "ja existia"
        self.stdout.write(self.style.SUCCESS(f"Task de agregacao: {status}."))
