from django.contrib import admin
from .models import Negocio, Produto, Localizacao, RedesSociais, VideoDestaque, FotoProduto


class ProdutoInline(admin.TabularInline):
    model  = Produto
    extra  = 0
    fields = ["nome", "disponivel", "preco"]


class FotoProdutoInline(admin.TabularInline):
    model   = FotoProduto
    extra   = 1
    max_num = 3
    fields  = ["foto", "alt_texto", "ordem"]


class RedesSociaisInline(admin.StackedInline):
    model = RedesSociais
    extra = 0


class LocalizacaoInline(admin.StackedInline):
    model = Localizacao
    extra = 0


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display  = ["nome", "negocio", "preco", "disponivel"]
    list_filter   = ["disponivel", "negocio"]
    search_fields = ["nome", "negocio__nome"]
    inlines       = [FotoProdutoInline]


@admin.register(Negocio)
class NegocioAdmin(admin.ModelAdmin):
    list_display    = ["nome", "cidade", "plano", "status", "verificado"]
    list_filter     = ["status", "plano", "verificado", "cidade"]
    search_fields   = ["nome", "cidade", "usuario__email"]
    inlines         = [RedesSociaisInline, LocalizacaoInline, ProdutoInline]
    readonly_fields = ["criado_em", "atualizado_em", "media_nota", "total_avaliacoes"]
