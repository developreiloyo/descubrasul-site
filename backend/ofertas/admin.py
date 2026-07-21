from django.contrib import admin
from .models import Oferta


@admin.register(Oferta)
class OfertaAdmin(admin.ModelAdmin):
    list_display  = ["titulo", "negocio", "status", "valor_cobrado", "publicado_em", "expira_em", "dias_restantes"]
    list_filter   = ["status"]
    search_fields = ["titulo", "negocio__nome"]
    readonly_fields = ["criado_em", "publicado_em", "expira_em", "mp_preference_id", "mp_payment_id"]
    actions       = ["ativar_manualmente"]

    @admin.action(description="Ativar manualmente (sem pagamento)")
    def ativar_manualmente(self, request, queryset):
        for oferta in queryset.filter(status=Oferta.Status.PENDENTE):
            oferta.ativar(mp_payment_id="manual")
        self.message_user(request, "Ofertas ativadas.")
