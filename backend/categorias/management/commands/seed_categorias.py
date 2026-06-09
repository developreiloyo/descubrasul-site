from django.core.management.base import BaseCommand
from categorias.models import Categoria


CATEGORIAS = [
    {"nome": "Restaurantes", "icone": "🍽️", "schema_tipo": "Restaurant",             "ordem": 1},
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


class Command(BaseCommand):
    help = "Popula as categorias iniciais do DescubraSul."

    def handle(self, *args, **options):
        criadas = 0
        for dados in CATEGORIAS:
            _, created = Categoria.objects.get_or_create(
                nome=dados["nome"],
                defaults=dados,
            )
            if created:
                criadas += 1
        self.stdout.write(self.style.SUCCESS(f"{criadas} categoria(s) criada(s)."))

