from django.core.management.base import BaseCommand
from categorias.models import Categoria


CATEGORIAS = [
    {"slug": "alimentos-bebidas",      "nome": "Alimentos e Bebidas",      "icone": "UtensilsCrossed",   "schema_tipo": "FoodEstablishment",        "ordem": 1},
    {"slug": "automotivo",             "nome": "Automotivo",               "icone": "Car",               "schema_tipo": "AutoDealer",               "ordem": 2},
    {"slug": "beleza-bem-estar",       "nome": "Beleza e Bem-estar",       "icone": "Sparkles",          "schema_tipo": "BeautySalon",              "ordem": 3},
    {"slug": "saude",                  "nome": "Saúde",                    "icone": "HeartPulse",        "schema_tipo": "MedicalBusiness",          "ordem": 4},
    {"slug": "esporte-fitness",        "nome": "Esporte e Fitness",        "icone": "Dumbbell",          "schema_tipo": "ExerciseGym",              "ordem": 5},
    {"slug": "casa-construcao",        "nome": "Casa e Construção",        "icone": "House",             "schema_tipo": "HomeAndConstructionBusiness", "ordem": 6},
    {"slug": "servicos",               "nome": "Serviços",                 "icone": "Wrench",            "schema_tipo": "LocalBusiness",            "ordem": 7},
    {"slug": "profissionais",          "nome": "Profissionais",            "icone": "BriefcaseBusiness", "schema_tipo": "ProfessionalService",      "ordem": 8},
    {"slug": "tecnologia-marketing",   "nome": "Tecnologia e Marketing",   "icone": "Monitor",           "schema_tipo": "LocalBusiness",            "ordem": 9},
    {"slug": "pets",                   "nome": "Pets",                     "icone": "PawPrint",          "schema_tipo": "PetStore",                 "ordem": 10},
    {"slug": "educacao",               "nome": "Educação",                 "icone": "GraduationCap",     "schema_tipo": "EducationalOrganization",  "ordem": 11},
    {"slug": "turismo-entretenimento", "nome": "Turismo e Entretenimento", "icone": "Palmtree",          "schema_tipo": "TouristAttraction",        "ordem": 12},
    {"slug": "financas-seguros",       "nome": "Finanças e Seguros",       "icone": "Landmark",          "schema_tipo": "FinancialService",         "ordem": 13},
    {"slug": "eventos",                "nome": "Eventos",                  "icone": "PartyPopper",       "schema_tipo": "EventVenue",               "ordem": 14},
    {"slug": "agropecuaria",           "nome": "Agropecuária",             "icone": "Sprout",            "schema_tipo": "LocalBusiness",            "ordem": 15},
    {"slug": "comercio",               "nome": "Comércio",                 "icone": "ShoppingBag",       "schema_tipo": "Store",                    "ordem": 16},
]


class Command(BaseCommand):
    help = "Popula/atualiza as categorias do DescubraSul (idempotente por slug)."

    def handle(self, *args, **options):
        criadas = atualizadas = 0
        for dados in CATEGORIAS:
            slug = dados["slug"]
            _, created = Categoria.objects.update_or_create(
                slug=slug,
                defaults={
                    "nome":        dados["nome"],
                    "icone":       dados["icone"],
                    "schema_tipo": dados.get("schema_tipo", ""),
                    "ordem":       dados["ordem"],
                },
            )
            if created:
                criadas += 1
            else:
                atualizadas += 1
        self.stdout.write(
            self.style.SUCCESS(f"{criadas} criada(s), {atualizadas} atualizada(s).")
        )
