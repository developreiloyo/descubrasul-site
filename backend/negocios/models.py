import uuid
import unicodedata
from django.db import models
from django.utils.text import slugify
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver


def normalizar_cidade(cidade: str) -> str:
    """Remove acentos e normaliza capitalização: 'criciúma' → 'Criciuma'."""
    sem_acento = unicodedata.normalize("NFKD", cidade).encode("ASCII", "ignore").decode()
    return sem_acento.strip().title()


def gerar_caminho_seguro(instance, filename):
    """Nunca usar nome original do usuário — sempre uuid4."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    pasta = instance.__class__.__name__.lower()
    return f"uploads/{pasta}/{uuid.uuid4()}.{ext}"


# ─── Limites por plano ────────────────────────────────────────────────
LIMITES_PRODUTOS = {
    "gratuito": 5,
    "basico":   20,
    "pro":      None,
    "producao": None,
    "fundador": None,
}


class Negocio(models.Model):

    class Plano(models.TextChoices):
        GRATUITO = "gratuito", "Gratuito"
        BASICO   = "basico",   "Básico — R$ 79/mês"
        PRO      = "pro",      "Pro — R$ 197/mês"
        PRODUCAO = "producao", "Produção — R$ 397/mês"
        FUNDADOR = "fundador", "Fundador — R$ 599/ano"

    class Status(models.TextChoices):
        ATIVO    = "ativo",    "Ativo"
        INATIVO  = "inativo",  "Inativo"
        PENDENTE = "pendente", "Pendente"

    usuario = models.OneToOneField(
        "usuarios.User",
        on_delete=models.CASCADE,
        related_name="negocio",
    )

    nome      = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    historia  = models.TextField(blank=True)
    logo      = models.ImageField(upload_to=gerar_caminho_seguro, null=True, blank=True)
    categoria = models.ForeignKey(
        "categorias.Categoria",
        on_delete=models.PROTECT,
        related_name="negocios",
    )
    cidade    = models.CharField(max_length=100)
    bairro    = models.CharField(max_length=100, blank=True)
    whatsapp  = models.CharField(max_length=20)
    website   = models.URLField(blank=True)
    plano     = models.CharField(max_length=20, choices=Plano.choices, default=Plano.GRATUITO)
    status    = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDENTE)
    verificado = models.BooleanField(default=False)
    criado_em  = models.DateTimeField(auto_now_add=True)

    slug            = models.SlugField(max_length=220, unique=True, blank=True)
    seo_title       = models.CharField(max_length=60, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)
    og_image        = models.ImageField(upload_to=gerar_caminho_seguro, null=True, blank=True)
    alt_logo        = models.CharField(max_length=125, blank=True)
    categoria_tipo  = models.CharField(max_length=50, blank=True)
    palavras_chave  = models.CharField(max_length=300, blank=True)
    atualizado_em   = models.DateTimeField(auto_now=True)

    # Espaço especial (plano Pro+): tipo + conteúdo configurável pelo comerciante
    # Tipos válidos: "texto" | "oferta" | "cupom" | "banner" | "video"
    espaco_especial = models.JSONField(null=True, blank=True)

    horario_abertura   = models.TimeField(null=True, blank=True)
    horario_fechamento = models.TimeField(null=True, blank=True)
    dias_funcionamento = models.JSONField(default=list, blank=True)

    media_nota       = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_avaliacoes = models.IntegerField(default=0)

    class Meta:
        verbose_name        = "Negócio"
        verbose_name_plural = "Negócios"
        indexes = [
            models.Index(fields=["cidade", "status"]),
            models.Index(fields=["slug"]),
            models.Index(fields=["plano", "status"]),
            models.Index(fields=["atualizado_em"]),
            models.Index(fields=["verificado", "status"]),
        ]

    def __str__(self):
        return f"{self.nome} — {self.cidade}"

    @property
    def is_pago(self):
        return self.plano != self.Plano.GRATUITO

    @property
    def is_pro(self):
        return self.plano in [self.Plano.PRO, self.Plano.PRODUCAO, self.Plano.FUNDADOR]

    @property
    def is_producao(self):
        return self.plano == self.Plano.PRODUCAO

    @property
    def limite_produtos(self):
        return LIMITES_PRODUTOS.get(self.plano)

    @property
    def pode_adicionar_produto(self):
        limite = self.limite_produtos
        if limite is None:
            return True
        return self.produtos.filter(disponivel=True).count() < limite

    @property
    def aparece_em_destaque(self):
        return self.is_pago

    def get_seo_title(self):
        return self.seo_title or f"{self.nome} em {self.cidade} | DescubraSul"

    def get_seo_description(self):
        return self.seo_description or f"{self.nome} — {self.categoria} em {self.cidade}. {self.descricao[:100]}"


class Produto(models.Model):

    negocio   = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name="produtos")

    nome        = models.CharField(max_length=200)
    foto        = models.ImageField(upload_to=gerar_caminho_seguro, null=True, blank=True)
    descricao   = models.TextField(blank=True)
    categoria   = models.CharField(max_length=100, blank=True)
    preco       = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    disponivel  = models.BooleanField(default=True)
    ordem = models.PositiveIntegerField(default=0)
    criado_em   = models.DateTimeField(auto_now_add=True)
    confirmado_em = models.DateTimeField(null=True, blank=True)

    slug            = models.SlugField(max_length=220, blank=True)
    alt_foto        = models.CharField(max_length=125, blank=True)
    descricao_longa = models.TextField(blank=True)
    atualizado_em   = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "Produto"
        verbose_name_plural = "Produtos"
        indexes = [
            models.Index(fields=["negocio", "disponivel"]),
            models.Index(fields=["disponivel", "atualizado_em"]),
            models.Index(fields=["confirmado_em"]),
            models.Index(fields=["slug"]),
        ]

    def __str__(self):
        return f"{self.nome} ({self.negocio.nome})"


class FotoProduto(models.Model):
    """Máximo 3 fotos por produto — validado no serializer."""
    produto   = models.ForeignKey(Produto, on_delete=models.CASCADE, related_name="fotos")
    foto      = models.ImageField(upload_to=gerar_caminho_seguro)
    alt_texto = models.CharField(max_length=125, blank=True)
    ordem     = models.PositiveSmallIntegerField(default=0)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = "Foto do Produto"
        verbose_name_plural = "Fotos do Produto"
        ordering            = ["ordem", "criado_em"]

    def __str__(self):
        return f"Foto de {self.produto.nome} ({self.ordem})"

class Localizacao(models.Model):
    """Geocodificada automaticamente via Google Maps (Plano Pro) ou manualmente."""

    negocio      = models.OneToOneField(Negocio, on_delete=models.CASCADE, related_name="localizacao")
    direccao     = models.CharField(max_length=300)
    direccao_fmt = models.CharField(max_length=300, blank=True)
    lat          = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng          = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    cidade       = models.CharField(max_length=100, blank=True)
    estado       = models.CharField(max_length=2, blank=True)
    cep          = models.CharField(max_length=9, blank=True)
    bairro       = models.CharField(max_length=100, blank=True)
    area_servico = models.CharField(max_length=300, blank=True)

    class Meta:
        verbose_name        = "Localização"
        verbose_name_plural = "Localizações"

    def __str__(self):
        return f"Localização de {self.negocio.nome}"

    def get_direccao_fmt(self):
        """Retorna endereço formatado — usa direccao_fmt se preenchido, senão monta."""
        if self.direccao_fmt:
            return self.direccao_fmt
        partes = [self.direccao, self.bairro, self.cidade]
        return ", ".join(p for p in partes if p)


class RedesSociais(models.Model):

    negocio       = models.OneToOneField(Negocio, on_delete=models.CASCADE, related_name="redes_sociais")
    instagram_url = models.URLField(blank=True)
    tiktok_url    = models.URLField(blank=True)
    facebook_url  = models.URLField(blank=True)
    youtube_url   = models.URLField(blank=True)
    x_url         = models.URLField(blank=True)

    class Meta:
        verbose_name        = "Redes Sociais"
        verbose_name_plural = "Redes Sociais"

    def __str__(self):
        return f"Redes de {self.negocio.nome}"


class VideoDestaque(models.Model):
    """Plano Pro — embed oEmbed salvo em cache no banco."""

    negocio      = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name="videos")
    url_original = models.URLField()
    plataforma   = models.CharField(max_length=20)
    oembed_html  = models.TextField(blank=True)
    criado_em    = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = "Vídeo Destaque"
        verbose_name_plural = "Vídeos Destaque"
        ordering            = ["-criado_em"]

    def __str__(self):
        return f"{self.plataforma} — {self.negocio.nome}"


# ─── Signals ──────────────────────────────────────────────────────────

@receiver(pre_save, sender=Negocio)
def normalizar_cidade_negocio(sender, instance, **kwargs):
    if instance.cidade:
        instance.cidade = normalizar_cidade(instance.cidade)


@receiver(pre_save, sender=Negocio)
def gerar_slug_negocio(sender, instance, **kwargs):
    if not instance.slug:
        base = slugify(f"{instance.nome}-{instance.cidade}")
        slug = base
        n = 1
        while Negocio.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
            slug = f"{base}-{n}"
            n += 1
        instance.slug = slug


@receiver(pre_save, sender=Produto)
def gerar_slug_produto(sender, instance, **kwargs):
    if not instance.slug:
        base = slugify(f"{instance.nome}-{instance.negocio_id}")
        slug = base
        n = 1
        while Produto.objects.filter(slug=slug, negocio=instance.negocio).exclude(pk=instance.pk).exists():
            slug = f"{base}-{n}"
            n += 1
        instance.slug = slug


@receiver(pre_save, sender=Localizacao)
def preencher_direccao_fmt(sender, instance, **kwargs):
    """Preenche direccao_fmt automaticamente ao salvar."""
    if not instance.direccao_fmt and instance.direccao:
        partes = [instance.direccao, instance.bairro, instance.cidade]
        instance.direccao_fmt = ", ".join(p for p in partes if p)


@receiver(post_save, sender=Localizacao)
def disparar_geocodificacao(sender, instance, **kwargs):
    """Dispatches async geocoding task whenever lat/lng is missing."""
    if instance.lat and instance.lng:
        return
    if not instance.get_direccao_fmt():
        return
    from negocios.tasks import geocodificar_localizacao
    geocodificar_localizacao.delay(instance.pk)
