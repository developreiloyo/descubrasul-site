from django.db import models


class Clique(models.Model):
    """
    Evento cru de interacao do visitante.
    Agregado diariamente em MetricaDiaria pela task Celery.
    """

    class Tipo(models.TextChoices):
        VIEW      = "view",      "Visualizacao da pagina"
        WHATSAPP  = "whatsapp",  "Clique no WhatsApp"
        PRODUTO   = "produto",   "Visualizacao de produto"
        SHARE     = "share",     "Compartilhamento"
        INSTAGRAM = "instagram", "Clique no Instagram"
        TIKTOK    = "tiktok",    "Clique no TikTok"
        FACEBOOK  = "facebook",  "Clique no Facebook"
        YOUTUBE   = "youtube",   "Clique no YouTube"
        MAPS      = "maps",      "Clique no Maps"

    class Origem(models.TextChoices):
        GOOGLE    = "google",    "Google"
        INSTAGRAM = "instagram", "Instagram"
        FACEBOOK  = "facebook",  "Facebook"
        WHATSAPP  = "whatsapp",  "WhatsApp"
        DIRETO    = "direto",    "Acesso direto"
        OUTRO     = "outro",     "Outro"

    negocio = models.ForeignKey(
        "negocios.Negocio",
        on_delete=models.CASCADE,
        related_name="cliques",
    )
    tipo    = models.CharField(max_length=20, choices=Tipo.choices)
    origem  = models.CharField(max_length=20, choices=Origem.choices, default=Origem.DIRETO)
    produto = models.ForeignKey(
        "negocios.Produto",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="cliques",
    )
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = "Clique"
        verbose_name_plural = "Cliques"
        indexes = [
            models.Index(fields=["negocio", "criado_em"]),
            models.Index(fields=["negocio", "tipo", "criado_em"]),
        ]

    def __str__(self):
        return f"{self.tipo} - {self.negocio.nome}"


class MetricaDiaria(models.Model):
    """
    Agregado diario pre-computado - dashboard responde em < 100ms.
    Preenchido pela task Celery agregar_metricas_diarias (00:30h).
    """

    negocio = models.ForeignKey(
        "negocios.Negocio",
        on_delete=models.CASCADE,
        related_name="metricas",
    )
    data = models.DateField()

    total_views    = models.IntegerField(default=0)
    total_produto  = models.IntegerField(default=0)
    total_whatsapp = models.IntegerField(default=0)
    total_shares   = models.IntegerField(default=0)

    origem_google    = models.IntegerField(default=0)
    origem_instagram = models.IntegerField(default=0)
    origem_facebook  = models.IntegerField(default=0)
    origem_whatsapp  = models.IntegerField(default=0)
    origem_direto    = models.IntegerField(default=0)

    cliques_instagram = models.IntegerField(default=0)
    cliques_tiktok    = models.IntegerField(default=0)
    cliques_facebook  = models.IntegerField(default=0)
    cliques_youtube   = models.IntegerField(default=0)
    cliques_maps      = models.IntegerField(default=0)

    taxa_conversao = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        verbose_name        = "Metrica Diaria"
        verbose_name_plural = "Metricas Diarias"
        unique_together     = ["negocio", "data"]
        indexes = [
            models.Index(fields=["negocio", "data"]),
        ]

    def __str__(self):
        return f"{self.negocio.nome} - {self.data}"
