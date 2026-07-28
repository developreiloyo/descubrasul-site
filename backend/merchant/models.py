from django.db import models
from negocios.models import Produto


class SincronizacaoGMC(models.Model):
    """Tracks the latest sync state of a Produto with Google Merchant Center."""

    class Estado(models.TextChoices):
        SUCESSO  = "sucesso",  "Sucesso"
        WARNING  = "warning",  "Warning"
        ERRO     = "erro",     "Erro"
        DELETADO = "deletado", "Deletado do GMC"

    produto         = models.OneToOneField(
        Produto,
        on_delete=models.CASCADE,
        related_name="sincronizacao_gmc",
    )
    estado          = models.CharField(max_length=20, choices=Estado.choices)
    gmc_offer_id    = models.CharField(max_length=300, blank=True)
    mensagem_google = models.TextField(blank=True)
    sincronizado_em = models.DateTimeField(auto_now=True)
    criado_em       = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = "Sincronização GMC"
        verbose_name_plural = "Sincronizações GMC"
        indexes = [
            models.Index(fields=["estado"]),
            models.Index(fields=["sincronizado_em"]),
        ]

    def __str__(self):
        return f"{self.produto} — {self.get_estado_display()} ({self.sincronizado_em:%Y-%m-%d})"
