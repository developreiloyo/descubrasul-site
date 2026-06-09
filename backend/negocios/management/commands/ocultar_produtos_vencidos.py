from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from negocios.models import Produto


class Command(BaseCommand):
    help = "Oculta produtos sem confirmacao ha mais de 30 dias."

    def handle(self, *args, **options):
        limite = timezone.now() - timedelta(days=30)
        atualizados = Produto.objects.filter(
            disponivel=True,
            confirmado_em__lt=limite,
        ).update(disponivel=False)
        self.stdout.write(
            self.style.SUCCESS(f"{atualizados} produto(s) ocultado(s).")
        )
