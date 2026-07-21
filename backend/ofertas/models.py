from decimal import Decimal
from datetime import timedelta
from django.db import models
from django.utils import timezone

VALOR_OFERTA = Decimal("20.00")
DURACAO_DIAS = 7


class Oferta(models.Model):

    class Status(models.TextChoices):
        PENDENTE  = "pendente",  "Aguardando pagamento"
        ATIVA     = "ativa",     "Ativa"
        EXPIRADA  = "expirada",  "Expirada"
        CANCELADA = "cancelada", "Cancelada"

    negocio = models.ForeignKey(
        "negocios.Negocio",
        on_delete=models.CASCADE,
        related_name="ofertas",
    )

    titulo         = models.CharField(max_length=80)
    descricao      = models.TextField()
    desconto_pct   = models.PositiveIntegerField(null=True, blank=True)
    preco_original = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    preco_novo     = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    imagem         = models.ImageField(upload_to="ofertas/", null=True, blank=True)

    status           = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDENTE, db_index=True)
    valor_cobrado    = models.DecimalField(max_digits=6, decimal_places=2, default=VALOR_OFERTA)
    mp_preference_id = models.CharField(max_length=100, blank=True, db_index=True)
    mp_payment_id    = models.CharField(max_length=100, blank=True, db_index=True)

    criado_em    = models.DateTimeField(auto_now_add=True)
    publicado_em = models.DateTimeField(null=True, blank=True)
    expira_em    = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        verbose_name        = "Oferta da Semana"
        verbose_name_plural = "Ofertas da Semana"
        ordering            = ["-publicado_em", "-criado_em"]
        indexes = [
            models.Index(fields=["status", "expira_em"]),
            models.Index(fields=["negocio", "status"]),
        ]

    def __str__(self):
        return f"{self.titulo} — {self.negocio.nome} ({self.status})"

    @property
    def dias_restantes(self):
        if not self.expira_em or self.status != self.Status.ATIVA:
            return 0
        delta = self.expira_em - timezone.now()
        return max(0, delta.days)

    def ativar(self, mp_payment_id=""):
        self.status         = self.Status.ATIVA
        self.mp_payment_id  = mp_payment_id
        self.publicado_em   = timezone.now()
        self.expira_em      = timezone.now() + timedelta(days=DURACAO_DIAS)
        self.save(update_fields=["status", "mp_payment_id", "publicado_em", "expira_em"])
