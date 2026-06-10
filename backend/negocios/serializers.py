from rest_framework import serializers
from .models import Negocio, Produto, Localizacao, RedesSociais, VideoDestaque
from categorias.serializers import CategoriaSerializer
from core.validators_seo import validar_texto_seo_completo, validar_seo_title
from .validators import validar_imagem


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
    class Meta:
        model  = Localizacao
        fields = ["direccao", "cep", "bairro", "cidade", "estado"]

class VideoDestaqueSerializer(serializers.ModelSerializer):
    class Meta:
        model  = VideoDestaque
        fields = ["plataforma", "oembed_html", "criado_em"]


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
        validar_texto_seo_completo(value, campo="descrição do negócio")
        return value

    def validate_seo_title(self, value):
        validar_seo_title(value)
        return value

    def validate_seo_description(self, value):
        validar_texto_seo_completo(value, campo="descrição SEO")
        return value

    def update(self, instance, validated_data):
        loc_data = validated_data.pop("localizacao", None)
        instance = super().update(instance, validated_data)

        if loc_data is not None:
            Localizacao.objects.update_or_create(
                negocio=instance,
                defaults=loc_data,
            )
        return instance


class NegocioPainelSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Negocio
        fields = [
            "slug", "nome", "descricao", "logo", "alt_logo",
            "categoria", "cidade", "bairro", "whatsapp", "website",
            "plano", "status", "verificado",
            "seo_title", "seo_description", "og_image", "palavras_chave",
            "horario_abertura", "horario_fechamento", "dias_funcionamento",
            "media_nota", "total_avaliacoes", "criado_em", "atualizado_em",
        ]
        read_only_fields = ["slug", "plano", "status", "verificado",
                            "media_nota", "total_avaliacoes", "criado_em", "atualizado_em"]


class ProdutoPublicoSerializer(serializers.ModelSerializer):
    negocio = serializers.SerializerMethodField()

    def validate_foto(self, value):
        if value:
            validar_imagem(value)
        return value

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


class ProdutoPainelSerializer(serializers.ModelSerializer):
    def validate_descricao(self, value):
        validar_texto_seo_completo(value, campo="descrição do produto")
        return value

    def validate_descricao_longa(self, value):
        validar_texto_seo_completo(value, campo="descrição longa")
        return value
    
    class Meta:
        model  = Produto
        fields = [
            "id", "slug", "nome", "foto", "alt_foto", "descricao",
            "descricao_longa", "categoria", "preco", "disponivel",
            "confirmado_em", "criado_em", "atualizado_em",
        ]
        read_only_fields = ["slug", "criado_em", "atualizado_em"]
