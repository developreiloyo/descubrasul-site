from django.contrib import admin
from .models import Categoria


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display   = ["nome", "slug", "schema_tipo", "icone", "ativo", "ordem"]
    list_editable  = ["ativo", "ordem"]
    prepopulated_fields = {"slug": ("nome",)}
