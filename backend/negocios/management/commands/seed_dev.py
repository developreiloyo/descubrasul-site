"""
Seed de dados para desenvolvimento e testes.
Cria categorias, usuários, negócios, produtos, localizações,
redes sociais e métricas de analytics simuladas.

Uso:
    python manage.py seed_dev
    python manage.py seed_dev --limpar   # apaga dados existentes antes
"""

import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone


CIDADES = [
    "Criciúma",
    "Içara",
    "Araranguá",
    "Tubarão",
    "Forquilhinha",
    "Morro da Fumaça",
    "Balneário Rincão",
]

NEGOCIOS_SEED = [
    # (nome, cidade, categoria_nome, plano, whatsapp, descricao)
    ("Cantina Nonna Rosa",    "Criciúma",        "Restaurantes", "pro",      "48991110001", "Culinária italiana artesanal desde 1998. Massas frescas e molhos da nonna."),
    ("Sports Zone",           "Içara",           "Academias",    "pro",      "48991110002", "Academia completa com musculação, spinning e personal trainer."),
    ("Boutique Liz",          "Araranguá",       "Moda",         "producao", "48991110003", "Moda feminina contemporânea com peças exclusivas e atendimento personalizado."),
    ("TechStore SC",          "Criciúma",        "Lojas Gerais", "basico",   "48991110004", "Eletrônicos, acessórios e assistência técnica especializada."),
    ("Studio Bella Vita",     "Tubarão",         "Estetica",     "pro",      "48991110005", "Salão de beleza completo: cabelo, unhas, estética e spa."),
    ("Pizzaria Sabores",      "Criciúma",        "Restaurantes", "basico",   "48991110006", "As melhores pizzas artesanais do sul catarinense, assadas em forno a lenha."),
    ("Papelaria Central",     "Criciúma",        "Lojas Gerais", "gratuito", "48991110007", "Material escolar, papelaria e artigos de escritório com os melhores preços."),
    ("Nutri Sul",             "Criciúma",        "Lojas Gerais", "basico",   "48991110008", "Suplementos e nutrição esportiva com consultoria especializada."),
    ("Casa & Lar",            "Forquilhinha",    "Lojas Gerais", "basico",   "48991110009", "Utilidades domésticas e decoração para o seu lar com qualidade e estilo."),
    ("Pet Paradise",          "Içara",           "Pet Shop",     "pro",      "48991110010", "Pet shop completo com banho, tosa, veterinário e loja de ração."),
    ("Clínica Saúde Sul",     "Tubarão",         "Clinicas",     "pro",      "48991110011", "Clínica médica com especialidades: clínico geral, cardiologia e pediatria."),
    ("Escola de Idiomas Plus","Criciúma",        "Educacao",     "basico",   "48991110012", "Inglês, espanhol e mandarim para todas as idades. Aulas online e presenciais."),
    ("Passos Certos",         "Tubarão",         "Moda",         "gratuito", "48991110013", "Calçados femininos e masculinos com conforto e estilo para o dia a dia."),
    ("Mecânica Sul Total",    "Morro da Fumaça",   "Servicos",     "basico",   "48991110014", "Mecânica geral, funilaria e pintura. Orçamento sem compromisso."),
    ("Sushi Zen",             "Içara",             "Restaurantes", "fundador", "48991110015", "Culinária japonesa autêntica. Rodízio de sushi e temaki fresquíssimos."),
    ("Pousada Mar Azul",      "Balneário Rincão",  "Servicos",     "pro",      "48991110016", "Pousada à beira-mar com quartos climatizados e café da manhã incluso."),
    ("Quiosque do Pescador",  "Balneário Rincão",  "Restaurantes", "basico",   "48991110017", "Frutos do mar frescos, camarão na brasa e caldeirada de peixe toda sexta."),
    ("Surf Shop Rincão",      "Balneário Rincão",  "Lojas Gerais", "gratuito", "48991110018", "Pranchas, wetsuits, acessórios e aulas de surf para todos os níveis."),
]

PRODUTOS_POR_NEGOCIO = {
    "Cantina Nonna Rosa": [
        ("Fettuccine al Tartufo",  "Massa fresca com molho de trufa negra e parmesão curado.", 89.90),
        ("Pizza Margherita",       "Massa fina, molho de tomate artesanal, mussarela e manjericão.", 52.90),
        ("Tiramisù",               "Sobremesa italiana clássica com mascarpone e café expresso.", 28.90),
    ],
    "Sports Zone": [
        ("Plano Mensal",           "Acesso completo à academia durante 30 dias.", 99.90),
        ("Plano Trimestral",       "3 meses de acesso com desconto especial.", 259.90),
        ("Personal Trainer 10x",   "10 sessões de personal trainer com profissional certificado.", 450.00),
    ],
    "Boutique Liz": [
        ("Vestido Floral Verão",   "Vestido leve em tecido chiffon com estampa floral exclusiva.", 189.90),
        ("Conjunto Alfaiataria",   "Blazer e calça em tecido premium. Disponível em 3 cores.", 349.90),
        ("Bolsa Couro Genuíno",    "Bolsa artesanal em couro legítimo com alça ajustável.", 279.90),
    ],
    "TechStore SC": [
        ("Fone Bluetooth Pro",     "Cancelamento de ruído ativo, 30h de bateria e áudio Hi-Fi.", 219.90),
        ("Smartphone Case MagSafe","Capa ultra-slim compatível com carregamento MagSafe.", 79.90),
        ("Hub USB-C 7 em 1",       "Entrada HDMI 4K, USB 3.0, SD card e carga rápida 100W.", 149.90),
    ],
    "Studio Bella Vita": [
        ("Coloração + Hidratação", "Coloração profissional com hidratação intensiva pós-química.", 180.00),
        ("Manicure + Pedicure",    "Esmaltação em gel de longa duração com design personalizado.", 85.00),
        ("Kit Skincare Natural 3x","Kit com sérum vitamina C, hidratante e protetor solar FPS50.", 149.90),
    ],
    "Pizzaria Sabores": [
        ("Pizza Grande Família",   "2 sabores à escolha, borda recheada e refrigerante 1,5L.", 79.90),
        ("Combo Casal",            "Pizza média + esfihas (6 un.) + 2 refrigerantes.", 59.90),
    ],
    "Nutri Sul": [
        ("Whey Protein 900g",      "Proteína isolada com 27g de proteína por dose. Sabor baunilha.", 139.90),
        ("Creatina Monohidratada", "5g por dose. Melhora desempenho e recuperação muscular.", 59.90),
        ("Vitamina D3 + K2 60caps","Suplemento de vitamina D3 2000UI com K2 para absorção ideal.", 49.90),
    ],
    "Pet Paradise": [
        ("Banho + Tosa Completa",  "Banho com shampoo especial, tosa higiênica e perfume.", 75.00),
        ("Ração Premium 15kg",     "Ração super premium para cães adultos de porte médio/grande.", 189.90),
        ("Consulta Veterinária",   "Consulta clínica geral com médico veterinário credenciado.", 120.00),
    ],
    "Sushi Zen": [
        ("Rodízio Completo",       "Mais de 50 tipos de sushi, temaki e hot roll sem limite.", 89.90),
        ("Box Sushi 30 peças",     "Combinado com 30 peças variadas para viagem ou entrega.", 65.90),
    ],
    "Pousada Mar Azul": [
        ("Quarto Standard Casal",  "Quarto com ar-condicionado, TV 40\" e banheiro privativo.", 180.00),
        ("Suíte Família",          "Suíte para até 4 pessoas com vista para o mar e varanda.", 280.00),
        ("Café da Manhã Avulso",   "Café da manhã regional com frutas, bolos e frios. Por pessoa.", 25.00),
    ],
    "Quiosque do Pescador": [
        ("Porção de Camarão 500g", "Camarão na brasa temperado com azeite, alho e limão.", 65.90),
        ("Caldeirada Mista",       "Peixe, camarão e mariscos cozidos no caldo do chef. Para 2.", 89.90),
        ("Espetinho de Peixe (3x)","Espetinhos de tilápia grelhados com tempero da casa.", 32.00),
    ],
    "Surf Shop Rincão": [
        ("Aula de Surf 1h30",      "Aula individual com instrutor certificado. Material incluso.", 80.00),
        ("Aluguel Prancha/dia",    "Prancha longboard ou shortboard por diária completa.", 40.00),
    ],
}

ENDERECOS = {
    "Criciúma":        ("Av. Centenário, 1.500",       "88801-000", "Centro"),
    "Içara":           ("Rua XV de Novembro, 320",      "88820-000", "Centro"),
    "Araranguá":       ("Rua Cel. Marcos Rovaris, 150", "88900-000", "Centro"),
    "Tubarão":         ("Av. Marcolino Martins, 800",   "88705-000", "Dehon"),
    "Forquilhinha":    ("Rua Marechal Deodoro, 55",     "88850-000", "Centro"),
    "Morro da Fumaça":   ("Av. Presidente Vargas, 200",   "88890-000", "Centro"),
    "Balneário Rincão":  ("Av. Atlântica, 1.200",         "88820-000", "Praia"),
}

REDES_POR_PLANO = {
    "gratuito": {},
    "basico":   {"instagram_url": "https://instagram.com/exemplo"},
    "pro":      {"instagram_url": "https://instagram.com/exemplo", "facebook_url": "https://facebook.com/exemplo"},
    "producao": {"instagram_url": "https://instagram.com/exemplo", "facebook_url": "https://facebook.com/exemplo", "tiktok_url": "https://tiktok.com/@exemplo"},
    "fundador": {"instagram_url": "https://instagram.com/exemplo", "facebook_url": "https://facebook.com/exemplo", "tiktok_url": "https://tiktok.com/@exemplo", "youtube_url": "https://youtube.com/@exemplo"},
}


class Command(BaseCommand):
    help = "Popula o banco com dados de desenvolvimento/teste."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limpar",
            action="store_true",
            help="Remove todos os dados de seed antes de recriar.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        from categorias.models import Categoria
        from usuarios.models import User
        from negocios.models import Negocio, Produto, Localizacao, RedesSociais
        from analytics.models import Clique, MetricaDiaria

        if options["limpar"]:
            self.stdout.write("Removendo dados existentes...")
            emails_seed = [f"seed{i:02d}@descubrasul.dev" for i in range(1, 20)]
            User.objects.filter(email__in=emails_seed).delete()
            self.stdout.write(self.style.WARNING("  Usuários seed removidos."))

        # ── 1. Categorias ──────────────────────────────────────────────
        self.stdout.write("\n1. Categorias...")
        self.call_command_seed_categorias()

        cat_map = {c.nome: c for c in Categoria.objects.all()}

        # ── 2. Negócios ────────────────────────────────────────────────
        self.stdout.write("2. Negócios, usuários e produtos...")
        criados = 0

        for idx, (nome, cidade, cat_nome, plano, whatsapp, descricao) in enumerate(NEGOCIOS_SEED, start=1):
            email = f"seed{idx:02d}@descubrasul.dev"

            user, user_criado = User.objects.get_or_create(
                email=email,
                defaults={"nome": f"Dono — {nome}", "role": User.Role.COMERCIANTE},
            )
            if user_criado:
                user.set_password("seed1234")
                user.save(update_fields=["password"])

            categoria = cat_map.get(cat_nome)
            if not categoria:
                self.stdout.write(self.style.WARNING(f"  Categoria '{cat_nome}' não encontrada — pulando {nome}"))
                continue

            negocio, neg_criado = Negocio.objects.get_or_create(
                usuario=user,
                defaults={
                    "nome":      nome,
                    "descricao": descricao,
                    "categoria": categoria,
                    "cidade":    cidade,
                    "whatsapp":  whatsapp,
                    "plano":     plano,
                    "status":    Negocio.Status.ATIVO,
                    "verificado": plano in ("pro", "producao", "fundador"),
                    "media_nota": round(random.uniform(4.3, 5.0), 1),
                    "total_avaliacoes": random.randint(12, 280),
                    "horario_abertura":   "08:00:00",
                    "horario_fechamento": "18:00:00",
                    "dias_funcionamento": ["seg", "ter", "qua", "qui", "sex"],
                },
            )

            if neg_criado:
                # Localização
                end, cep, bairro = ENDERECOS.get(cidade, ("Rua Principal, 1", "00000-000", "Centro"))
                Localizacao.objects.get_or_create(
                    negocio=negocio,
                    defaults={
                        "direccao": end,
                        "cep":      cep,
                        "bairro":   bairro,
                        "cidade":   cidade,
                        "estado":   "SC",
                    },
                )

                # Redes sociais
                redes = REDES_POR_PLANO.get(plano, {})
                if redes:
                    RedesSociais.objects.get_or_create(negocio=negocio, defaults=redes)

                # Produtos
                for p_nome, p_desc, p_preco in PRODUTOS_POR_NEGOCIO.get(nome, []):
                    Produto.objects.get_or_create(
                        negocio=negocio,
                        nome=p_nome,
                        defaults={
                            "descricao":    p_desc,
                            "preco":        p_preco,
                            "disponivel":   True,
                            "confirmado_em": timezone.now(),
                        },
                    )

                criados += 1
                self.stdout.write(f"  ✓ {nome} ({plano}) — {cidade}")

        self.stdout.write(self.style.SUCCESS(f"  {criados} negócio(s) criado(s)."))

        # ── 3. Métricas de analytics (últimos 30 dias) ─────────────────
        self.stdout.write("3. Métricas de analytics...")
        metricas_criadas = 0
        hoje = date.today()

        for negocio in Negocio.objects.filter(usuario__email__startswith="seed"):
            if negocio.plano == "gratuito":
                continue

            base_views = random.randint(20, 120)
            for d in range(30):
                dia = hoje - timedelta(days=d)
                views     = max(0, base_views + random.randint(-15, 25))
                whatsapp  = max(0, int(views * random.uniform(0.04, 0.18)))
                shares    = max(0, int(views * random.uniform(0.01, 0.06)))
                total_ori = views or 1

                _, created = MetricaDiaria.objects.get_or_create(
                    negocio=negocio,
                    data=dia,
                    defaults={
                        "total_views":       views,
                        "total_whatsapp":    whatsapp,
                        "total_shares":      shares,
                        "origem_google":     int(views * random.uniform(0.25, 0.45)),
                        "origem_instagram":  int(views * random.uniform(0.15, 0.30)),
                        "origem_facebook":   int(views * random.uniform(0.05, 0.15)),
                        "origem_whatsapp":   int(views * random.uniform(0.05, 0.10)),
                        "origem_direto":     int(views * random.uniform(0.10, 0.20)),
                        "taxa_conversao":    round((whatsapp / views) * 100, 2) if views else 0,
                    },
                )
                if created:
                    metricas_criadas += 1

        self.stdout.write(self.style.SUCCESS(f"  {metricas_criadas} registro(s) de métrica criado(s)."))

        # ── Resumo final ───────────────────────────────────────────────
        self.stdout.write("\n" + "─" * 50)
        self.stdout.write(self.style.SUCCESS("Seed concluído!"))
        self.stdout.write(f"  Negócios: {Negocio.objects.filter(usuario__email__startswith='seed').count()}")
        self.stdout.write(f"  Usuários seed: {User.objects.filter(email__startswith='seed').count()}")
        self.stdout.write(f"  Produtos:  {Produto.objects.filter(negocio__usuario__email__startswith='seed').count()}")
        self.stdout.write("")
        self.stdout.write("Credenciais dos comerciantes:")
        self.stdout.write("  Email:  seed01@descubrasul.dev … seed15@descubrasul.dev")
        self.stdout.write("  Senha:  seed1234")
        self.stdout.write("")

    def call_command_seed_categorias(self):
        from categorias.management.commands.seed_categorias import Command as SeedCat
        cmd = SeedCat()
        cmd.stdout = self.stdout
        cmd.stderr = self.stderr
        cmd.style  = self.style
        cmd.handle()
