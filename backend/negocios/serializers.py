from rest_framework import serializers
from .models import Negocio, Produto, Localizacao, RedesSociais, VideoDestaque
from .validators import validar_imagem
from categorias.serializers import CategoriaSerializer
from core.validators_seo import validar_texto_seo_completo, validar_seo_title


class RedesSociaisSerializer(serializers.ModelSerializer):
    class Meta:
        model  = RedesSociais
        fields = ["instagram_url", "tiktok_url", "facebook_url", "youtube_url", "x_url"]


class LocalizacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Localizacao
        fields = ["direccao_fmt", "lat", "lng", "cidade", "bairro", "area_servico"]


class LocalizacaoPainelSerializer(serializers.ModelSerializer):
    """Edicao da localizacao pelo comerciante no painel."""
    direccao = serializers.CharField(required=False, allow_blank=True, max_length=300)

    class Meta:
        model  = Localizacao
        fields = ["direccao", "cep", "bairro", "cidade", "estado"]
        extra_kwargs = {
            "cep":    {"required": False, "allow_blank": True},
            "bairro": {"required": False, "allow_blank": True},
            "cidade": {"required": False, "allow_blank": True},
            "estado": {"required": False, "allow_blank": True},
        }


class VideoDestaqueSerializer(serializers.ModelSerializer):
    class Meta:
        model  = VideoDestaque
        fields = ["plataforma", "oembed_html", "criado_em"]


# ─── Serializer publico (visitante) ───────────────────────────────────
class NegocioPublicoSerializer(serializers.ModelSerializer):
    categoria       = CategoriaSerializer(read_only=True)
    redes_sociais   = RedesSociaisSerializer(read_only=True)
    localizacao     = LocalizacaoSerializer(read_only=True)
    videos          = VideoDestaqueSerializer(many=True, read_only=True)
    seo_title       = serializers.SerializerMethodField()
    seo_description = serializers.SerializerMethodField()

    class Meta:
        model  = Negocio
        fields = [
            "slug", "nome", "descricao", "logo", "alt_logo",
            "categoria", "categoria_tipo", "cidade", "bairro",
            "whatsapp", "website", "verificado", "plano",
            "horario_abertura", "horario_fechamento", "dias_funcionamento",
            "media_nota", "total_avaliacoes", "atualizado_em",
            "seo_title", "seo_description", "og_image", "palavras_chave",
            "redes_sociais", "localizacao", "videos",
        ]

    def get_seo_title(self, obj):
        return obj.get_seo_title()

    def get_seo_description(self, obj):
        return obj.get_seo_description()


# ─── Serializer do painel (comerciante) ───────────────────────────────
class NegocioPainelSerializer(serializers.ModelSerializer):
    localizacao = LocalizacaoPainelSerializer(required=False)

    class Meta:
        model  = Negocio
        fields = [
            "slug", "nome", "descricao", "logo", "alt_logo",
            "categoria", "cidade", "bairro", "whatsapp", "website",
            "plano", "status", "verificado",
            "seo_title", "seo_description", "og_image", "palavras_chave",
            "horario_abertura", "horario_fechamento", "dias_funcionamento",
            "media_nota", "total_avaliacoes", "criado_em", "atualizado_em",
            "localizacao",
        ]
        read_only_fields = ["slug", "plano", "status", "verificado",
                            "media_nota", "total_avaliacoes", "criado_em", "atualizado_em"]

    def validate_descricao(self, value):
        validar_texto_seo_completo(value, campo="descricao do negocio")
        return value

    def validate_seo_title(self, value):
        validar_seo_title(value)
        return value

    def validate_seo_description(self, value):
        validar_texto_seo_completo(value, campo="descricao SEO")
        return value

    def update(self, instance, validated_data):
        loc_data = validated_data.pop("localizacao", None)
        instance = super().update(instance, validated_data)

        # So criar/atualizar localizacao se houver algum dado preenchido
        if loc_data and any(v for v in loc_data.values()):
            Localizacao.objects.update_or_create(
                negocio=instance,
                defaults=loc_data,
            )
        return instance


# ─── Produto publico ──────────────────────────────────────────────────
class ProdutoPublicoSerializer(serializers.ModelSerializer):
    negocio = serializers.SerializerMethodField()

    class Meta:
        model  = Produto
        fields = [
            "slug", "nome", "foto", "alt_foto", "descricao",
            "descricao_longa", "categoria", "preco", "disponivel",
            "atualizado_em", "negocio",
        ]

    def get_negocio(self, obj):
        return {
            "slug":      obj.negocio.slug,
            "nome":      obj.negocio.nome,
            "cidade":    obj.negocio.cidade,
            "categoria": str(obj.negocio.categoria),
            "whatsapp":  obj.negocio.whatsapp,
        }


# ─── Produto painel (comerciante) ─────────────────────────────────────
class ProdutoPainelSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Produto
        fields = [
            "id", "slug", "nome", "foto", "alt_foto", "descricao",
            "descricao_longa", "categoria", "preco", "disponivel",
            "confirmado_em", "criado_em", "atualizado_em",
        ]
        read_only_fields = ["slug", "criado_em", "atualizado_em"]

    def validate_foto(self, value):
        if value:
            validar_imagem(value)
        return value

    def validate_descricao(self, value):
        validar_texto_seo_completo(value, campo="descricao do produto")
        return value