"""
Data migration: canonicaliza o conjunto de categorias.

Problema: o ambiente de dev acumulou categorias legadas (de seeds antigos)
misturadas com as 24 canônicas criadas por 0004_update_categorias.
O resultado eram 35 categorias ativas — bagunça visível no formulário de cadastro.

Esta migration:
1. Desativa TODAS as categorias que não pertencem ao conjunto canônico.
2. Garante que as 24 canônicas estejam ativas com o slug correto.
3. Corrige o typo 'servicos-vehiculares' → 'servicos-veiculares'.

Segura em produção (idempotente — se as categorias já estiverem corretas, não muda nada).
"""
from django.db import migrations
from django.utils.text import slugify


CATEGORIAS_CANONICAS = [
    {"nome": "Automotivo",                                    "slug": "automotivo",                                    "ordem": 1},
    {"nome": "Beleza e Bem-estar",                            "slug": "beleza-e-bem-estar",                            "ordem": 2},
    {"nome": "Casa e Construção",                             "slug": "casa-e-construcao",                             "ordem": 3},
    {"nome": "Comunicação Visual, Gráficas e Personalização", "slug": "comunicacao-visual-graficas-e-personalizacao",  "ordem": 4},
    {"nome": "Consultoria e Serviços Empresariais",           "slug": "consultoria-e-servicos-empresariais",           "ordem": 5},
    {"nome": "Contabilidade e Finanças",                      "slug": "contabilidade-e-financas",                      "ordem": 6},
    {"nome": "Educação e Treinamentos",                       "slug": "educacao-e-treinamentos",                       "ordem": 7},
    {"nome": "Engenharia e Arquitetura",                      "slug": "engenharia-e-arquitetura",                      "ordem": 8},
    {"nome": "Eventos e Entretenimento",                      "slug": "eventos-e-entretenimento",                      "ordem": 9},
    {"nome": "Gastronomia e Alimentação",                     "slug": "gastronomia-e-alimentacao",                     "ordem": 10},
    {"nome": "Imobiliário",                                   "slug": "imobiliario",                                   "ordem": 11},
    {"nome": "Limpeza e Conservação",                         "slug": "limpeza-e-conservacao",                         "ordem": 12},
    {"nome": "Locação de Equipamentos e Máquinas",            "slug": "locacao-de-equipamentos-e-maquinas",            "ordem": 13},
    {"nome": "Manutenção e Assistência Técnica",              "slug": "manutencao-e-assistencia-tecnica",              "ordem": 14},
    {"nome": "Moda, Costura e Locações",                      "slug": "moda-costura-e-locacoes",                       "ordem": 15},
    {"nome": "Pets",                                          "slug": "pets",                                          "ordem": 16},
    {"nome": "Saúde",                                         "slug": "saude",                                         "ordem": 17},
    {"nome": "Segurança e Chaveiros",                         "slug": "seguranca-e-chaveiros",                         "ordem": 18},
    {"nome": "Serviços Gerais",                               "slug": "servicos-gerais",                               "ordem": 19},
    {"nome": "Serviços Jurídicos",                            "slug": "servicos-juridicos",                            "ordem": 20},
    {"nome": "Serviços Veiculares",                           "slug": "servicos-veiculares",                           "ordem": 21},
    {"nome": "Tecnologia, Informática e Marketing",           "slug": "tecnologia-informatica-e-marketing",            "ordem": 22},
    {"nome": "Transporte e Logística",                        "slug": "transporte-e-logistica",                        "ordem": 23},
    {"nome": "Turismo e Hospedagem",                          "slug": "turismo-e-hospedagem",                          "ordem": 24},
]

SLUGS_CANONICOS = [c["slug"] for c in CATEGORIAS_CANONICAS]
NOMES_CANONICOS = [c["nome"] for c in CATEGORIAS_CANONICAS]


def canonicalizar(apps, schema_editor):
    Categoria = apps.get_model("categorias", "Categoria")

    # 1. Desativa tudo que não é canônico (por nome E por slug)
    Categoria.objects.exclude(nome__in=NOMES_CANONICOS).update(ativo=False)

    # 2. Garante que cada categoria canônica existe com slug, nome e ativo corretos
    for dados in CATEGORIAS_CANONICAS:
        # Tenta achar pelo nome (mais estável que slug no caso de typos)
        obj = Categoria.objects.filter(nome=dados["nome"]).first()
        if obj:
            changed = False
            if obj.slug != dados["slug"]:
                obj.slug = dados["slug"]
                changed = True
            if not obj.ativo:
                obj.ativo = True
                changed = True
            if obj.ordem != dados["ordem"]:
                obj.ordem = dados["ordem"]
                changed = True
            if changed:
                obj.save(update_fields=["slug", "ativo", "ordem"])
        # Se não existe pelo nome, tenta pelo slug antigo (e.g. 'servicos-vehiculares')
        # Isso não cria novas categorias — 0004 já fez isso; aqui só corrigimos.

    # 3. Corrige especificamente o typo do slug vehiculares → veiculares
    Categoria.objects.filter(
        slug="servicos-vehiculares"
    ).exclude(
        slug="servicos-veiculares"
    ).update(
        slug="servicos-veiculares",
        nome="Serviços Veiculares",
        ativo=True,
    )


def reverse_canonicalizar(apps, schema_editor):
    # Sem operação de reverso segura — não podemos saber o estado anterior
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("categorias", "0004_update_categorias"),
    ]

    operations = [
        migrations.RunPython(canonicalizar, reverse_canonicalizar),
    ]
