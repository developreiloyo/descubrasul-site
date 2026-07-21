from rest_framework import serializers
from .models import Oferta


class OfertaPublicaSerializer(serializers.ModelSerializer):
    negocio_slug      = serializers.CharField(source="negocio.slug", read_only=True)
    negocio_nome      = serializers.CharField(source="negocio.nome", read_only=True)
    negocio_logo      = serializers.ImageField(source="negocio.logo", read_only=True)
    negocio_cidade    = serializers.CharField(source="negocio.cidade", read_only=True)
    negocio_categoria = serializers.CharField(source="negocio.categoria.nome", read_only=True)
    negocio_cat_slug  = serializers.CharField(source="negocio.categoria.slug", read_only=True)
    negocio_whatsapp  = serializers.CharField(source="negocio.whatsapp", read_only=True)
    dias_restantes    = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Oferta
        fields = [
            "id", "titulo", "descricao", "desconto_pct",
            "preco_original", "preco_novo", "imagem",
            "expira_em", "dias_restantes",
            "negocio_slug", "negocio_nome", "negocio_logo",
            "negocio_cidade", "negocio_categoria", "negocio_cat_slug",
            "negocio_whatsapp",
        ]


class OfertaPainelSerializer(serializers.ModelSerializer):
    dias_restantes = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Oferta
        fields = [
            "id", "titulo", "descricao", "desconto_pct",
            "preco_original", "preco_novo", "imagem",
            "status", "valor_cobrado", "dias_restantes",
            "criado_em", "publicado_em", "expira_em",
        ]
        read_only_fields = ["status", "valor_cobrado", "publicado_em", "expira_em"]

    def validate_desconto_pct(self, value):
        if value is not None and not (1 <= value <= 99):
            raise serializers.ValidationError("Desconto deve ser entre 1% e 99%.")
        return value

    def validate(self, data):
        orig = data.get("preco_original")
        novo = data.get("preco_novo")
        if orig is not None and novo is not None and novo >= orig:
            raise serializers.ValidationError("Preço novo deve ser menor que o original.")
        return data
