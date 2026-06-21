from rest_framework import serializers
from .models import Negocio, Produto, Localizacao, RedesSociais, VideoDestaque, FotoProduto
from .validators import validar_imagem
from categorias.serializers import CategoriaSerializer
from core.validators_seo import validar_texto_seo_completo, validar_seo_title


class RedesSociaisSerializer(serializers.ModelSerializer):
    class Meta:
        model  = RedesSociais
        fields = ["instagram_url", "tiktok_url", "facebook_url", "youtube_url", "x_url"]


class RedesSociaisPainelSerializer(serializers.ModelSerializer):
    class Meta:
        model  = RedesSociais
        fields = ["instagram_url", "tiktok_url", "facebook_url", "youtube_url", "x_url"]
        extra_kwargs = {
            "instagram_url": {"required": False, "allow_blank": True},
            "tiktok_url":    {"required": False, "allow_blank": True},
            "facebook_url":  {"required": False, "allow_blank": True},
            "youtube_url":   {"required": False, "allow_blank": True},
            "x_url":         {"required": False, "allow_blank": True},
        }


class LocalizacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Localizacao
        fields = ["direccao", "cep", "direccao_fmt", "lat", "lng", "cidade", "bairro", "area_servico"]


class LocalizacaoPainelSerializer(serializers.ModelSerializer):
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


class FotoProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FotoProduto
        fields = ["id", "foto", "alt_texto", "ordem"]


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
            "slug", "nome", "descricao", "historia", "logo", "alt_logo",
            "categoria", "categoria_tipo", "cidade", "bairro",
            "whatsapp", "website", "verificado", "plano",
            "horario_abertura", "horario_fechamento", "dias_funcionamento",
            "media_nota", "total_avaliacoes", "atualizado_em",
            "seo_title", "seo_description", "og_image", "palavras_chave",
            "redes_sociais", "localizacao", "videos", "espaco_especial",
        ]

    def get_seo_title(self, obj):
        return obj.get_seo_title()

    def get_seo_description(self, obj):
        return obj.get_seo_description()


# ─── Serializer do painel (comerciante) ───────────────────────────────
class NegocioPainelSerializer(serializers.ModelSerializer):
    localizacao   = LocalizacaoPainelSerializer(required=False)
    redes_sociais = RedesSociaisPainelSerializer(required=False)
    categoria     = CategoriaSerializer(read_only=True)

    class Meta:
        model  = Negocio
        fields = [
            "slug", "nome", "descricao", "historia", "logo", "alt_logo",
            "categoria", "cidade", "bairro", "whatsapp", "website",
            "plano", "status", "verificado",
            "seo_title", "seo_description", "og_image", "palavras_chave",
            "horario_abertura", "horario_fechamento", "dias_funcionamento",
            "media_nota", "total_avaliacoes", "criado_em", "atualizado_em",
            "localizacao", "redes_sociais", "espaco_especial",
        ]
        read_only_fields = ["slug", "plano", "status", "verificado",
                            "media_nota", "total_avaliacoes", "criado_em", "atualizado_em"]

    def validate_descricao(self, value):
        validar_texto_seo_completo(value, campo="descricao do negocio")
        return value

    def validate_historia(self, value):
        if value:
            validar_texto_seo_completo(value, campo="historia do negocio")
        return value

    def validate_seo_title(self, value):
        validar_seo_title(value)
        return value

    def validate_seo_description(self, value):
        validar_texto_seo_completo(value, campo="descricao SEO")
        return value

    def validate_espaco_especial(self, value):
        if value is None:
            return value
        TIPOS_VALIDOS = {"texto", "oferta", "cupom", "banner", "video"}
        if value.get("tipo") not in TIPOS_VALIDOS:
            raise serializers.ValidationError("Tipo de espaço especial inválido.")
        cta_link = value.get("cta_link", "")
        if cta_link and not cta_link.startswith(("https://", "http://")):
            raise serializers.ValidationError(
                "cta_link deve ser uma URL http ou https válida."
            )
        return value

    def update(self, instance, validated_data):
        loc_data   = validated_data.pop("localizacao", None)
        redes_data = validated_data.pop("redes_sociais", None)
        instance = super().update(instance, validated_data)

        if loc_data and any(v for v in loc_data.values()):
            if not loc_data.get("direccao_fmt") and loc_data.get("direccao"):
                partes = [
                    loc_data.get("direccao", ""),
                    loc_data.get("bairro", ""),
                    loc_data.get("cidade", ""),
                ]
                loc_data["direccao_fmt"] = ", ".join(p for p in partes if p)
            Localizacao.objects.update_or_create(
                negocio=instance,
                defaults=loc_data,
            )

        if redes_data is not None:
            RedesSociais.objects.update_or_create(
                negocio=instance,
                defaults=redes_data,
            )
        return instance


# ─── Produto publico ──────────────────────────────────────────────────
class ProdutoPublicoSerializer(serializers.ModelSerializer):
    negocio = serializers.SerializerMethodField()
    fotos   = FotoProdutoSerializer(many=True, read_only=True)

    class Meta:
        model  = Produto
        fields = [
            "slug", "nome", "foto", "alt_foto", "descricao",
            "descricao_longa", "categoria", "preco", "disponivel",
            "atualizado_em", "negocio", "fotos",
        ]

    def get_negocio(self, obj):
        return {
            "slug":           obj.negocio.slug,
            "nome":           obj.negocio.nome,
            "cidade":         obj.negocio.cidade,
            "categoria":      str(obj.negocio.categoria),
            "categoria_slug": obj.negocio.categoria.slug,
            "whatsapp":       obj.negocio.whatsapp,
        }


# ─── Produto painel (comerciante) ─────────────────────────────────────
class ProdutoPainelSerializer(serializers.ModelSerializer):
    fotos = FotoProdutoSerializer(many=True, read_only=True)

    class Meta:
        model  = Produto
        fields = [
            "id", "slug", "nome", "foto", "alt_foto", "descricao",
            "descricao_longa", "categoria", "preco", "disponivel",
            "confirmado_em", "criado_em", "atualizado_em", "fotos",
        ]
        read_only_fields = ["slug", "criado_em", "atualizado_em"]

    def validate_foto(self, value):
        if value:
            validar_imagem(value)
        return value

    def validate_descricao(self, value):
        validar_texto_seo_completo(value, campo="descricao do produto")
        return value