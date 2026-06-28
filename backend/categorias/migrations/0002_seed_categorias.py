"""
Data migration: pobla as categorias iniciais do DescubraSul.

Equivalente ao management command `seed_categorias`, mas executado
automaticamente em cada `manage.py migrate` (deploy). Idempotente:
pode rodar múltiplas vezes sem duplicar (usa get_or_create por nome).

NOTA: as data migrations não disparam signals do modelo, então o slug
é gerado explicitamente aqui com slugify(). Em runtime normal o signal
pre_save no models.py se encarrega disso.
"""
from django.db import migrations
from django.utils.text import slugify


CATEGORIAS = [
    {"nome": "Restaurantes", "icone": "🍽️", "schema_tipo": "Restaurant",              "ordem": 1},
    {"nome": "Moda",         "icone": "👗",  "schema_tipo": "ClothingStore",           "ordem": 2},
    {"nome": "Estetica",     "icone": "💅",  "schema_tipo": "BeautySalon",             "ordem": 3},
    {"nome": "Academias",    "icone": "💪",  "schema_tipo": "ExerciseGym",             "ordem": 4},
    {"nome": "Pet Shop",     "icone": "🐾",  "schema_tipo": "PetStore",                "ordem": 5},
    {"nome": "Clinicas",     "icone": "🏥",  "schema_tipo": "MedicalBusiness",         "ordem": 6},
    {"nome": "Educacao",     "icone": "📚",  "schema_tipo": "EducationalOrganization", "ordem": 7},
    {"nome": "Lojas Gerais", "icone": "🛍️", "schema_tipo": "Store",                   "ordem": 8},
    {"nome": "Servicos",     "icone": "🔧",  "schema_tipo": "LocalBusiness",           "ordem": 9},
    {"nome": "Alimentacao",  "icone": "🥗",  "schema_tipo": "FoodEstablishment",       "ordem": 10},
]


def seed_categorias(apps, schema_editor):
    """Cria as 10 categorias base. Idempotente via get_or_create por nome."""
    Categoria = apps.get_model("categorias", "Categoria")
    for dados in CATEGORIAS:
        Categoria.objects.get_or_create(
            nome=dados["nome"],
            defaults={
                **dados,
                "slug": slugify(dados["nome"]),
            },
        )


def reverse_seed(apps, schema_editor):
    """Rollback: remove apenas as categorias criadas por este seed."""
    Categoria = apps.get_model("categorias", "Categoria")
    nomes = [c["nome"] for c in CATEGORIAS]
    Categoria.objects.filter(nome__in=nomes).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("categorias", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_categorias, reverse_seed),
    ]
