from django.contrib import admin
from .models import Assinatura


@admin.register(Assinatura)
class AssinaturaAdmin(admin.ModelAdmin):
    list_display   = ["negocio", "plano", "status", "mp_subscription_id", "proximo_vencimento", "criado_em"]
    list_filter    = ["status", "plano"]
    search_fields  = ["negocio__nome", "negocio__usuario__email", "mp_subscription_id"]
    readonly_fields = ["criado_em", "atualizado_em"]
    ordering       = ["-criado_em"]
