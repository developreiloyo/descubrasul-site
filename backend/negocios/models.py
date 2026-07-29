import uuid
import unicodedata
from django.db import models
from django.utils.text import slugify
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver


def normalizar_cidade(cidade: str) -> str:
    """Remove acentos para comparação normalizada: 'Içara' → 'icara'."""
    sem_acento = unicodedata.normalize("NFKD", cidade).encode("ASCII", "ignore").decode()
    return sem_acento.strip().lower()


def gerar_caminho_seguro(instance, filename):
    """Nunca usar nome original do usuário — sempre uuid4."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    pasta = instance.__class__.__name__.lower()
    return f"uploads/{pasta}/{uuid.uuid4()}.{ext}"


# ─── Configuração única por plano (fonte de verdade) ─────────────────
PLANO_CONFIG = {
    "gratuito": {
        "limite_produtos":         5,
        "fotos_por_produto":       1,
        "permite_video":           False,
        "limite_produtos_publico": 5,
    },
    "pro": {
        "limite_produtos":         5,
        "fotos_por_produto":       3,
        "permite_video":           False,
        "limite_produtos_publico": 5,
    },
    "producao": {
        "limite_produtos":         10,
        "fotos_por_produto":       3,
        "permite_video":           True,
        "limite_produtos_publico": 10,
    },
}

# Mantidos para retrocompatibilidade com código existente
LIMITES_PRODUTOS = {k: v["limite_produtos"] for k, v in PLANO_CONFIG.items()}
LIMITES_FOTOS_GALERIA = {"gratuito": 0, "pro": 10, "producao": 10}


class Negocio(models.Model):

    class Plano(models.TextChoices):
        GRATUITO = "gratuito", "Presença Sul — Gratuito"
        PRO      = "pro",      "Conexão Sul — R$ 197/ano"
        PRODUCAO = "producao", "Destaque Sul — R$ 397/ano"

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
    telefone         = models.CharField(max_length=20, blank=True)
    email_contato    = models.EmailField(blank=True)
    nome_responsavel = models.CharField(max_length=200, blank=True)
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
    palavras_chave   = models.CharField(max_length=300, blank=True)
    google_place_id  = models.CharField(max_length=200, blank=True, default="")
    atualizado_em    = models.DateTimeField(auto_now=True)

    # Espaço especial (plano Pro+): tipo + conteúdo configurável pelo comerciante
    # Tipos válidos: "texto" | "oferta" | "cupom" | "banner" | "video"
    espaco_especial = models.JSONField(null=True, blank=True)

    horario_abertura   = models.TimeField(null=True, blank=True)
    horario_fechamento = models.TimeField(null=True, blank=True)
    dias_funcionamento = models.JSONField(default=list, blank=True)

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
        return self.plano in [self.Plano.PRO, self.Plano.PRODUCAO]

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
            return True  # fallback seguro para planos não mapeados
        return self.produtos.filter(disponivel=True).count() < limite

    @property
    def limite_fotos_produto(self):
        return PLANO_CONFIG.get(self.plano, PLANO_CONFIG["gratuito"])["fotos_por_produto"]

    @property
    def permite_video(self):
        return PLANO_CONFIG.get(self.plano, PLANO_CONFIG["gratuito"])["permite_video"]

    @property
    def limite_fotos_galeria(self):
        return LIMITES_FOTOS_GALERIA.get(self.plano, 0)

    @property
    def pode_adicionar_foto_galeria(self):
        limite = self.limite_fotos_galeria
        if limite == 0:
            return False
        return self.fotos_galeria.count() < limite

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

    slug              = models.SlugField(max_length=220, blank=True)
    alt_foto          = models.CharField(max_length=125, blank=True)
    descricao_longa   = models.TextField(blank=True)
    tipo_produto      = models.CharField(max_length=120, blank=True, null=True)
    video_youtube_url = models.URLField(blank=True, default="")
    atualizado_em     = models.DateTimeField(auto_now=True)

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


class FotoNegocio(models.Model):
    """Galeria de fotos do negócio — disponível apenas nos planos Pro e Produção."""
    negocio   = models.ForeignKey(Negocio, on_delete=models.CASCADE, related_name="fotos_galeria")
    foto      = models.ImageField(upload_to=gerar_caminho_seguro)
    alt_texto = models.CharField(max_length=125, blank=True)
    ordem     = models.PositiveSmallIntegerField(default=0)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering            = ["ordem", "-criado_em"]
        verbose_name        = "Foto da Galeria"
        verbose_name_plural = "Fotos da Galeria"

    def __str__(self):
        return f"Galeria de {self.negocio.nome} ({self.ordem})"

class Localizacao(models.Model):
    """Geocodificada automaticamente via Google Maps (Plano Pro) ou manualmente."""

    negocio      = models.OneToOneField(Negocio, on_delete=models.CASCADE, related_name="localizacao")
    direccao     = models.CharField(max_length=300, blank=True)
    logradouro   = models.CharField(max_length=200, blank=True)
    numero       = models.CharField(max_length=20, blank=True)
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
    linkedin_url  = models.URLField(blank=True)

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
    """Armazena a forma canônica (com acentos) de CIDADES_ATENDIDAS.
    Fallback: mantém o valor como veio se não encontrar correspondência."""
    if not instance.cidade:
        return
    from core.constants import CIDADES_ATENDIDAS
    normalized_input = normalizar_cidade(instance.cidade)
    for _, nome in CIDADES_ATENDIDAS:
        if normalizar_cidade(nome) == normalized_input:
            instance.cidade = nome
            return


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
    """Builds direccao_fmt from logradouro + numero + bairro + cidade."""
    rua = instance.logradouro or instance.direccao
    partes = [rua, instance.numero, instance.bairro, instance.cidade]
    fmt = ", ".join(p for p in partes if p)
    if fmt:
        instance.direccao_fmt = fmt


@receiver(post_save, sender=Localizacao)
def sincronizar_bairro_negocio(sender, instance, **kwargs):
    """Keeps Negocio.bairro in sync with Localizacao.bairro."""
    if instance.bairro and instance.negocio.bairro != instance.bairro:
        Negocio.objects.filter(pk=instance.negocio_id).update(bairro=instance.bairro)


@receiver(post_delete, sender=FotoNegocio)
def apagar_arquivo_foto_negocio(sender, instance, **kwargs):
    """Remove o arquivo do storage ao deletar o registro — evita arquivos órfãos."""
    if instance.foto:
        instance.foto.delete(save=False)


@receiver(post_delete, sender=FotoProduto)
def apagar_arquivo_foto_produto(sender, instance, **kwargs):
    """Remove o arquivo do storage ao deletar o registro — evita arquivos órfãos."""
    if instance.foto:
        instance.foto.delete(save=False)


@receiver(post_save, sender=Localizacao)
def disparar_geocodificacao(sender, instance, **kwargs):
    """Dispatches async geocoding task whenever lat/lng is missing."""
    if instance.lat and instance.lng:
        return
    if not instance.get_direccao_fmt():
        return
    from negocios.tasks import geocodificar_localizacao
    geocodificar_localizacao.delay(instance.pk)
