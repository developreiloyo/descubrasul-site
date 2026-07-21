"""
Data migration: substitui as 10 categorias iniciais pelas 24 definitivas.

- Desativa as categorias antigas (ativo=False) para preservar FKs existentes.
- Cria as novas via get_or_create (idempotente).
- O campo `icone` agora usa chave de string que mapeia para o componente
  correto em `src/lib/categoria-icons.tsx` no frontend.
"""
from django.db import migrations
from django.utils.text import slugify


CATEGORIAS_ANTIGAS = [
    "Restaurantes", "Moda", "Estetica", "Academias", "Pet Shop",
    "Clinicas", "Educacao", "Lojas Gerais", "Servicos", "Alimentacao",
]

CATEGORIAS_NOVAS = [
    {"nome": "Automotivo",                                    "icone": "WrenchScrewdriver", "schema_tipo": "AutoRepair",                  "ordem": 1},
    {"nome": "Beleza e Bem-estar",                            "icone": "Sparkles",           "schema_tipo": "BeautySalon",                 "ordem": 2},
    {"nome": "Casa e Construção",                             "icone": "HomeModern",         "schema_tipo": "HomeGoodsStore",              "ordem": 3},
    {"nome": "Comunicação Visual, Gráficas e Personalização", "icone": "PaintBrush",         "schema_tipo": "LocalBusiness",               "ordem": 4},
    {"nome": "Consultoria e Serviços Empresariais",           "icone": "Briefcase",          "schema_tipo": "ProfessionalService",         "ordem": 5},
    {"nome": "Contabilidade e Finanças",                      "icone": "Banknotes",          "schema_tipo": "AccountingService",           "ordem": 6},
    {"nome": "Educação e Treinamentos",                       "icone": "AcademicCap",        "schema_tipo": "EducationalOrganization",     "ordem": 7},
    {"nome": "Engenharia e Arquitetura",                      "icone": "BuildingOffice2",    "schema_tipo": "ProfessionalService",         "ordem": 8},
    {"nome": "Eventos e Entretenimento",                      "icone": "Ticket",             "schema_tipo": "EntertainmentBusiness",       "ordem": 9},
    {"nome": "Gastronomia e Alimentação",                     "icone": "Fire",               "schema_tipo": "FoodEstablishment",           "ordem": 10},
    {"nome": "Imobiliário",                                   "icone": "Home",               "schema_tipo": "RealEstateAgent",             "ordem": 11},
    {"nome": "Limpeza e Conservação",                         "icone": "Sun",                "schema_tipo": "LocalBusiness",               "ordem": 12},
    {"nome": "Locação de Equipamentos e Máquinas",            "icone": "Cog6Tooth",          "schema_tipo": "LocalBusiness",               "ordem": 13},
    {"nome": "Manutenção e Assistência Técnica",              "icone": "Wrench",             "schema_tipo": "LocalBusiness",               "ordem": 14},
    {"nome": "Moda, Costura e Locações",                      "icone": "Swatch",             "schema_tipo": "ClothingStore",               "ordem": 15},
    {"nome": "Pets",                                          "icone": "Heart",              "schema_tipo": "PetStore",                    "ordem": 16},
    {"nome": "Saúde",                                         "icone": "PlusCircle",         "schema_tipo": "MedicalBusiness",             "ordem": 17},
    {"nome": "Segurança e Chaveiros",                         "icone": "Key",                "schema_tipo": "LocalBusiness",               "ordem": 18},
    {"nome": "Serviços Gerais",                               "icone": "RectangleStack",     "schema_tipo": "LocalBusiness",               "ordem": 19},
    {"nome": "Serviços Jurídicos",                            "icone": "Scale",              "schema_tipo": "LegalService",                "ordem": 20},
    {"nome": "Serviços Vehiculares",                          "icone": "Truck",              "schema_tipo": "AutoDealer",                  "ordem": 21},
    {"nome": "Tecnologia, Informática e Marketing",           "icone": "ComputerDesktop",    "schema_tipo": "LocalBusiness",               "ordem": 22},
    {"nome": "Transporte e Logística",                        "icone": "GlobeAlt",           "schema_tipo": "LocalBusiness",               "ordem": 23},
    {"nome": "Turismo e Hospedagem",                          "icone": "MapPin",             "schema_tipo": "TouristInformationCenter",    "ordem": 24},
]


def update_categorias(apps, schema_editor):
    Categoria = apps.get_model("categorias", "Categoria")

    # Desativa antigas preservando FKs de Negocio já cadastrados
    Categoria.objects.filter(nome__in=CATEGORIAS_ANTIGAS).update(ativo=False)

    # Cria/atualiza as novas (idempotente)
    for dados in CATEGORIAS_NOVAS:
        obj, created = Categoria.objects.get_or_create(
            nome=dados["nome"],
            defaults={
                **dados,
                "ativo": True,
                "slug": slugify(dados["nome"]),
            },
        )
        if not created:
            # Garante que campos estejam atualizados mesmo em re-run
            obj.icone = dados["icone"]
            obj.schema_tipo = dados["schema_tipo"]
            obj.ordem = dados["ordem"]
            obj.ativo = True
            obj.save(update_fields=["icone", "schema_tipo", "ordem", "ativo"])


def reverse_update(apps, schema_editor):
    Categoria = apps.get_model("categorias", "Categoria")
    nomes_novos = [c["nome"] for c in CATEGORIAS_NOVAS]
    Categoria.objects.filter(nome__in=nomes_novos).delete()
    Categoria.objects.filter(nome__in=CATEGORIAS_ANTIGAS).update(ativo=True)


class Migration(migrations.Migration):

    dependencies = [
        ("categorias", "0003_categoria_icone_maxlength"),
    ]

    operations = [
        migrations.RunPython(update_categorias, reverse_update),
    ]
