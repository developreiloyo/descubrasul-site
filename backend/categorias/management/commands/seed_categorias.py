from django.core.management.base import BaseCommand
from categorias.models import Categoria


CATEGORIAS = [
    {"slug": "automotivo",                                   "nome": "Automotivo",                                    "icone": "WrenchScrewdriver", "schema_tipo": "AutoRepair",               "ordem": 1},
    {"slug": "beleza-e-bem-estar",                           "nome": "Beleza e Bem-estar",                            "icone": "Sparkles",          "schema_tipo": "BeautySalon",              "ordem": 2},
    {"slug": "casa-e-construcao",                            "nome": "Casa e Construção",                             "icone": "HomeModern",        "schema_tipo": "HomeGoodsStore",           "ordem": 3},
    {"slug": "comunicacao-visual-graficas-e-personalizacao", "nome": "Comunicação Visual, Gráficas e Personalização", "icone": "PaintBrush",        "schema_tipo": "LocalBusiness",            "ordem": 4},
    {"slug": "consultoria-e-servicos-empresariais",          "nome": "Consultoria e Serviços Empresariais",           "icone": "Briefcase",         "schema_tipo": "ProfessionalService",      "ordem": 5},
    {"slug": "contabilidade-e-financas",                     "nome": "Contabilidade e Finanças",                      "icone": "Banknotes",         "schema_tipo": "AccountingService",        "ordem": 6},
    {"slug": "educacao-e-treinamentos",                      "nome": "Educação e Treinamentos",                       "icone": "AcademicCap",       "schema_tipo": "EducationalOrganization",  "ordem": 7},
    {"slug": "engenharia-e-arquitetura",                     "nome": "Engenharia e Arquitetura",                      "icone": "BuildingOffice2",   "schema_tipo": "ProfessionalService",      "ordem": 8},
    {"slug": "eventos-e-entretenimento",                     "nome": "Eventos e Entretenimento",                      "icone": "Ticket",            "schema_tipo": "EntertainmentBusiness",    "ordem": 9},
    {"slug": "gastronomia-e-alimentacao",                    "nome": "Gastronomia e Alimentação",                     "icone": "Fire",              "schema_tipo": "FoodEstablishment",        "ordem": 10},
    {"slug": "imobiliario",                                  "nome": "Imobiliário",                                   "icone": "Home",              "schema_tipo": "RealEstateAgent",          "ordem": 11},
    {"slug": "limpeza-e-conservacao",                        "nome": "Limpeza e Conservação",                         "icone": "Sun",               "schema_tipo": "LocalBusiness",            "ordem": 12},
    {"slug": "locacao-de-equipamentos-e-maquinas",           "nome": "Locação de Equipamentos e Máquinas",            "icone": "Cog6Tooth",         "schema_tipo": "LocalBusiness",            "ordem": 13},
    {"slug": "manutencao-e-assistencia-tecnica",             "nome": "Manutenção e Assistência Técnica",              "icone": "Wrench",            "schema_tipo": "LocalBusiness",            "ordem": 14},
    {"slug": "moda-costura-e-locacoes",                      "nome": "Moda, Costura e Locações",                      "icone": "Swatch",            "schema_tipo": "ClothingStore",            "ordem": 15},
    {"slug": "pets",                                         "nome": "Pets",                                          "icone": "Heart",             "schema_tipo": "PetStore",                 "ordem": 16},
    {"slug": "saude",                                        "nome": "Saúde",                                         "icone": "PlusCircle",        "schema_tipo": "MedicalBusiness",          "ordem": 17},
    {"slug": "seguranca-e-chaveiros",                        "nome": "Segurança e Chaveiros",                         "icone": "Key",               "schema_tipo": "LocalBusiness",            "ordem": 18},
    {"slug": "servicos-gerais",                              "nome": "Serviços Gerais",                               "icone": "RectangleStack",    "schema_tipo": "LocalBusiness",            "ordem": 19},
    {"slug": "servicos-juridicos",                           "nome": "Serviços Jurídicos",                            "icone": "Scale",             "schema_tipo": "LegalService",             "ordem": 20},
    {"slug": "servicos-veiculares",                          "nome": "Serviços Veiculares",                           "icone": "Truck",             "schema_tipo": "AutomotiveBusiness",       "ordem": 21},
    {"slug": "tecnologia-informatica-e-marketing",           "nome": "Tecnologia, Informática e Marketing",           "icone": "ComputerDesktop",   "schema_tipo": "LocalBusiness",            "ordem": 22},
    {"slug": "transporte-e-logistica",                       "nome": "Transporte e Logística",                        "icone": "GlobeAlt",          "schema_tipo": "LocalBusiness",            "ordem": 23},
    {"slug": "turismo-e-hospedagem",                         "nome": "Turismo e Hospedagem",                          "icone": "MapPin",            "schema_tipo": "TouristInformationCenter", "ordem": 24},
]


class Command(BaseCommand):
    help = "Popula/atualiza as 24 categorias canônicas do DescubraSul (idempotente por slug)."

    def handle(self, *args, **options):
        criadas = atualizadas = 0
        for dados in CATEGORIAS:
            _, created = Categoria.objects.update_or_create(
                slug=dados["slug"],
                defaults={
                    "nome":        dados["nome"],
                    "icone":       dados["icone"],
                    "schema_tipo": dados["schema_tipo"],
                    "ordem":       dados["ordem"],
                    "ativo":       True,
                },
            )
            if created:
                criadas += 1
            else:
                atualizadas += 1
        self.stdout.write(
            self.style.SUCCESS(f"{criadas} criada(s), {atualizadas} atualizada(s).")
        )
