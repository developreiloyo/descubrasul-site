from decimal import Decimal
from django.db import models


CATALOGO_PLANOS = {
    "pro": {
        "nome":       "Conexão Sul",
        "valor":      Decimal("197.00"),
        "periodo":    "anual",
        "frequencia": 12,
        "descricao":  "Produtos ilimitados, analytics, IA, destaque nas buscas, Google Shopping",
    },
    "producao": {
        "nome":       "Destaque Sul",
        "valor":      Decimal("397.00"),
        "periodo":    "anual",
        "frequencia": 12,
        "descricao":  "Tudo do Conexão Sul + fotos profissionais + vídeo destaque + gestão GBP mensal",
    },
}


class Assinatura(models.Model):

    class Status(models.TextChoices):
        PENDENTE  = "pendente",  "Aguardando autorização"
        ATIVA     = "ativa",     "Ativa"
        PAUSADA   = "pausada",   "Pausada"
        CANCELADA = "cancelada", "Cancelada"
        ENCERRADA = "encerrada", "Encerrada"

    negocio = models.OneToOneField(
        "negocios.Negocio",
        on_delete=models.CASCADE,
        related_name="assinatura",
    )
    plano  = models.CharField(max_length=20)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDENTE,
    )
    mp_subscription_id = models.CharField(max_length=100, blank=True, db_index=True)
    proximo_vencimento = models.DateTimeField(null=True, blank=True)
    cancelado_em       = models.DateTimeField(null=True, blank=True)
    criado_em          = models.DateTimeField(auto_now_add=True)
    atualizado_em      = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "Assinatura"
        verbose_name_plural = "Assinaturas"
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["cancelado_em"]),
        ]

    def __str__(self):
        return f"{self.negocio.nome} — {self.plano} ({self.status})"
