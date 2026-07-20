from rest_framework import serializers
from .models import Assinatura, CATALOGO_PLANOS


class AssinaturaSerializer(serializers.ModelSerializer):
    plano_display = serializers.SerializerMethodField()

    class Meta:
        model  = Assinatura
        fields = [
            "plano",
            "plano_display",
            "status",
            "mp_subscription_id",
            "proximo_vencimento",
            "cancelado_em",
            "criado_em",
        ]
        read_only_fields = fields

    def get_plano_display(self, obj):
        info = CATALOGO_PLANOS.get(obj.plano)
        return info["nome"] if info else obj.plano.capitalize()
