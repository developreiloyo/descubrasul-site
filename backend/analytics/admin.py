from django.contrib import admin
from .models import Clique, MetricaDiaria


@admin.register(Clique)
class CliqueAdmin(admin.ModelAdmin):
    list_display   = ["negocio", "tipo", "origem", "criado_em"]
    list_filter    = ["tipo", "origem"]
    date_hierarchy = "criado_em"


@admin.register(MetricaDiaria)
class MetricaDiariaAdmin(admin.ModelAdmin):
    list_display = ["negocio", "data", "total_views", "total_whatsapp", "taxa_conversao"]
    list_filter  = ["data"]
