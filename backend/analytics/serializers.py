from rest_framework import serializers
from .models import Clique, MetricaDiaria


class CliqueSerializer(serializers.ModelSerializer):
    negocio_slug = serializers.SlugField(write_only=True)
    produto_slug = serializers.SlugField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model  = Clique
        fields = ["negocio_slug", "produto_slug", "tipo", "origem"]

    def validate(self, attrs):
        from negocios.models import Negocio, Produto

        slug = attrs.pop("negocio_slug")
        try:
            attrs["negocio"] = Negocio.objects.get(
                slug=slug, status=Negocio.Status.ATIVO
            )
        except Negocio.DoesNotExist:
            raise serializers.ValidationError("Negocio nao encontrado.")

        produto_slug = attrs.pop("produto_slug", "")
        if produto_slug:
            attrs["produto"] = Produto.objects.filter(
                slug=produto_slug, negocio=attrs["negocio"]
            ).first()

        return attrs


class MetricaDiariaSerializer(serializers.ModelSerializer):
    class Meta:
        model   = MetricaDiaria
        exclude = ["id", "negocio"]

