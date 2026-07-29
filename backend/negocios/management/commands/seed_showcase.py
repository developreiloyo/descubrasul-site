"""
Cria dados de showcase para visualizar o design de cada plano e as Ofertas da Semana.
Idempotente — pode rodar múltiplas vezes sem duplicar.

Uso:
    python manage.py seed_showcase
    python manage.py seed_showcase --limpar   # remove e recria
"""

from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone


# ── Dados dos negócios (um por plano) ────────────────────────────────
SHOWCASE = [
    {
        "email":   "showcase_gratuito@descubrasul.dev",
        "plano":   "gratuito",
        "google_place_id": "",
        "nome":    "Papelaria Arco-Íris",
        "descricao": "Material escolar, papelaria criativa e artigos de escritório. Os melhores preços de Criciúma para estudantes e profissionais.",
        "cidade":  "Criciúma",
        "cat":     "Comércio",
        "whatsapp": "48991200001",
        "verificado": False,
        "horario": ("08:00", "18:00"),
        "dias":    ["seg", "ter", "qua", "qui", "sex", "sab"],
        "redes":   {},
        "historia": "",
        "produtos": [
            ("Caderno Universitário 200fls", "Caderno espiral resistente com capa dura. Ideal para faculdade.", Decimal("29.90")),
            ("Kit Canetas Stabilo 10 cores", "Canetas marca-texto e esferográficas coloridas. Para estudo e planejamento.", Decimal("39.90")),
            ("Mochila Escolar 30L",          "Mochila resistente com compartimento para notebook de até 15,6\".", Decimal("119.90")),
            ("Agenda 2026 Executiva",         "Agenda semanal com capa dura, marcadores e espaço para anotações.", Decimal("49.90")),
            ("Calculadora Científica",        "120 funções, visor de 2 linhas, bateria solar e comum.", Decimal("79.90")),
        ],
        "espaco_especial": None,
    },
    {
        "email":   "showcase_basico@descubrasul.dev",
        "plano":   "gratuito",
        "google_place_id": "",
        "nome":    "Pizzaria Bella Vista",
        "descricao": "As melhores pizzas artesanais do sul catarinense, assadas em forno a lenha com ingredientes selecionados. Delivery e salão.",
        "cidade":  "Içara",
        "cat":     "Gastronomia e Alimentação",
        "whatsapp": "48991200002",
        "verificado": False,
        "horario": ("18:00", "23:30"),
        "dias":    ["ter", "qua", "qui", "sex", "sab", "dom"],
        "redes":   {"instagram_url": "https://instagram.com/pizzariabellavista"},
        "historia": "Fundada em 2018 pelo casal Marcos e Juliana, a Bella Vista nasceu da paixão pela pizza de verdade — feita com massa longa fermentação, molho artesanal e ingredientes frescos da região.",
        "produtos": [
            ("Pizza Margherita Grande",   "Massa fina, molho de tomate artesanal, mussarela fior di latte e manjericão fresco.", Decimal("62.90")),
            ("Pizza Quattro Formaggi",    "Mussarela, gorgonzola, catupiry e parmesão. Irresistível para os amantes de queijo.", Decimal("74.90")),
            ("Pizza Calabresa Especial",  "Calabresa artesanal, cebola roxa caramelizada e azeitonas pretas. Borda recheada.", Decimal("68.90")),
            ("Combo Casal (2 pizzas M)",  "Escolha 2 sabores médios + refrigerante 1,5L. Perfeito para jantar em dois.", Decimal("99.90")),
            ("Calzone de Frango",         "Massa recheada com frango, requeijão, milho e catupiry. Assado no forno a lenha.", Decimal("48.90")),
            ("Tiramisu Caseiro",          "Sobremesa italiana com mascarpone, café e cacau em pó. Feito na hora.", Decimal("22.90")),
        ],
        "espaco_especial": None,
    },
    {
        "email":   "showcase_pro@descubrasul.dev",
        "plano":   "pro",
        "google_place_id": "showcase_pro_place_id",
        "nome":    "Studio Élite Beleza",
        "descricao": "Salão de beleza completo em Criciúma especializado em coloração, tratamentos capilares e estética avançada. Profissionais certificados e produtos premium.",
        "cidade":  "Criciúma",
        "cat":     "Beleza e Bem-estar",
        "whatsapp": "48991200003",
        "verificado": True,
        "horario": ("09:00", "19:00"),
        "dias":    ["seg", "ter", "qua", "qui", "sex", "sab"],
        "redes":   {
            "instagram_url": "https://instagram.com/studioelitebeleza",
            "facebook_url":  "https://facebook.com/studioelitebeleza",
            "tiktok_url":    "https://tiktok.com/@studioelite",
        },
        "historia": "Há 10 anos transformando a autoestima das clientes do Sul de SC. Nossa equipe é formada por profissionais com formação internacional em colorimetria avançada e tendências europeias.",
        "produtos": [
            ("Coloração + Hidratação",    "Coloração profissional com hidratação intensiva pós-química. Resultado natural e duradouro.", Decimal("180.00")),
            ("Luzes Californianas",       "Técnica de balayage para efeito natural de luzes. Inclui máscara de nutrição pós-serviço.", Decimal("280.00")),
            ("Progressiva Profissional",  "Alisamento com produto vegano e sem formol. Dura até 6 meses. Inclui hidratação.", Decimal("220.00")),
            ("Manicure + Pedicure",       "Esmaltação em gel de longa duração com design personalizado. Dura até 3 semanas.", Decimal("85.00")),
            ("Limpeza de Pele Completa",  "Higienização profunda, esfoliação, extração e máscara hidratante. 90 minutos.", Decimal("150.00")),
            ("Kit Skincare Natural 3 itens","Sérum vitamina C, hidratante facial FPS50 e gel de limpeza. Marca nacional premium.", Decimal("149.90")),
        ],
        "espaco_especial": {
            "tipo":     "oferta",
            "titulo":   "Outubro Rosa — 20% OFF em todos os tratamentos",
            "conteudo": "Durante todo o mês de outubro, todos os serviços de estética e cuidados com a pele com 20% de desconto. Agende seu horário.",
            "badge":    "Promoção Especial",
            "cta_texto": "Agendar agora",
            "cta_link":  "https://wa.me/5548991200003",
        },
    },
    {
        "email":   "showcase_producao@descubrasul.dev",
        "plano":   "producao",
        "google_place_id": "",
        "nome":    "Boutique Liz Fashion",
        "descricao": "Moda feminina contemporânea com peças exclusivas e atendimento personalizado. Coleções nacionais e importadas com curadoria especial para a mulher do Sul.",
        "cidade":  "Tubarão",
        "cat":     "Moda, Costura e Locações",
        "whatsapp": "48991200004",
        "verificado": True,
        "horario": ("09:00", "18:00"),
        "dias":    ["seg", "ter", "qua", "qui", "sex", "sab"],
        "redes":   {
            "instagram_url": "https://instagram.com/boutiquelizfashion",
            "facebook_url":  "https://facebook.com/boutiquelizfashion",
            "tiktok_url":    "https://tiktok.com/@boutiqueliz",
            "youtube_url":   "https://youtube.com/@boutiqueliz",
        },
        "historia": "A Boutique Liz nasceu em 2015 com a missão de trazer moda de qualidade para Tubarão. Liz Rodrigues, fundadora e estilista, viaja duas vezes ao ano para São Paulo e Buenos Aires trazendo as tendências mais atuais.",
        "produtos": [
            ("Vestido Floral Midi",        "Vestido em tecido chiffon com estampa floral exclusiva. Disponível em P, M, G e GG.", Decimal("189.90")),
            ("Conjunto Alfaiataria Bege",  "Blazer cropped + calça wide leg em tecido premium. Elegância para o dia a dia.", Decimal("349.90")),
            ("Bolsa Couro Tote Grande",    "Bolsa artesanal em couro legítimo com alça de ombro e compartimento laptop.", Decimal("279.90")),
            ("Tênis Chunky Branco",        "Tênis plataforma em couro sintético premium. Confortável e estiloso.", Decimal("219.90")),
            ("Jaqueta Jeans Premium",      "Jaqueta em denim pesado com detalhes bordados. Peça exclusiva da coleção inverno.", Decimal("299.90")),
            ("Óculos Cat-Eye Acetato",     "Armação feminina em acetato com lentes polarizadas UV400.", Decimal("189.90")),
        ],
        "espaco_especial": {
            "tipo":     "banner",
            "titulo":   "Nova Coleção Verão 2026",
            "conteudo": "Peças exclusivas já disponíveis na loja e pelo Instagram. Frete grátis para Tubarão e região em compras acima de R$ 200.",
            "cta_texto": "Ver coleção",
            "cta_link":  "https://instagram.com/boutiquelizfashion",
            "imagem_alt": "Nova Coleção Verão 2026 — Boutique Liz",
        },
    },
    {
        "email":   "showcase_fundador@descubrasul.dev",
        "plano":   "producao",
        "google_place_id": "showcase_fundador_place_id",
        "nome":    "Cantina Nonna Rosa",
        "descricao": "Culinária italiana artesanal desde 1998. Massas frescas feitas diariamente, molhos da nonna e ambiente acolhedor no coração de Criciúma.",
        "cidade":  "Criciúma",
        "cat":     "Gastronomia e Alimentação",
        "whatsapp": "48991200005",
        "verificado": True,
        "horario": ("12:00", "22:30"),
        "dias":    ["ter", "qua", "qui", "sex", "sab", "dom"],
        "redes":   {
            "instagram_url": "https://instagram.com/cantinanonnnarosa",
            "facebook_url":  "https://facebook.com/cantinanonnnarosa",
            "tiktok_url":    "https://tiktok.com/@nonnnarosa",
            "youtube_url":   "https://youtube.com/@nonnnarosa",
        },
        "historia": "A história da Cantina Nonna Rosa começa com a Nonna Rosaria, imigrante italiana que chegou ao Sul de SC em 1965 trazendo na bagagem as receitas da família Bianchi, de Vicenza. Hoje, na terceira geração, mantemos viva a tradição das massas artesanais e dos molhos de panela, feitos com tomates San Marzano e azeite extra virgem importado.",
        "produtos": [
            ("Fettuccine al Tartufo",     "Massa fresca com molho de trufa negra, parmesão curado 24 meses e noz-moscada.", Decimal("89.90")),
            ("Ossobuco alla Milanese",    "Ossobuco de vitelo braseado no vinho branco com gremolata e risoto de açafrão.", Decimal("129.90")),
            ("Ravioli di Spinaci",        "Ravioli recheado com ricota, espinafre e nozes ao molho de manteiga e sálvia.", Decimal("79.90")),
            ("Bistecca Fiorentina 500g",  "Corte florentino grelhado ao ponto com ervas frescas e azeite trufado.", Decimal("149.90")),
            ("Tiramisù Originale",        "Receita original da nonna com mascarpone importado, café expresso e biscoito savoiardi.", Decimal("32.90")),
            ("Panna Cotta ao Coulis",     "Creme de baunilha italiana com coulis de frutas vermelhas frescas.", Decimal("28.90")),
        ],
        "espaco_especial": {
            "tipo":     "oferta",
            "titulo":   "Jantar Romântico para Dois",
            "conteudo": "Entrada + prato principal + sobremesa + taça de vinho italiano. Uma experiência gastronômica completa.",
            "badge":    "Menu Degustação",
            "cta_texto": "Reservar mesa",
            "cta_link":  "https://wa.me/5548991200005",
            "desconto":  "30",
        },
    },
]

# ── Dados das Ofertas da Semana ────────────────────────────────────────
OFERTAS = [
    {
        "negocio_email": "showcase_fundador@descubrasul.dev",
        "titulo":         "30% OFF no jantar para dois",
        "descricao":      "Jantar completo para dois com entrada, prato principal e sobremesa. Massa artesanal, ingredientes italianos e ambiente acolhedor.",
        "desconto_pct":   30,
        "preco_original": Decimal("180.00"),
        "preco_novo":     Decimal("126.00"),
    },
    {
        "negocio_email": "showcase_pro@descubrasul.dev",
        "titulo":         "Pacote Hidratação Capilar Completo",
        "descricao":      "Hidratação profissional com produtos premium: máscara de nutrição, banho de brilho e escova finalizadora. Resultado imediato e duradouro.",
        "desconto_pct":   15,
        "preco_original": Decimal("220.00"),
        "preco_novo":     Decimal("187.00"),
    },
    {
        "negocio_email": "showcase_producao@descubrasul.dev",
        "titulo":         "Conjunto Alfaiataria com 20% OFF",
        "descricao":      "Blazer + calça em tecido premium da nova coleção. Elegância contemporânea para o dia a dia executivo ou casual chic.",
        "desconto_pct":   20,
        "preco_original": Decimal("349.90"),
        "preco_novo":     Decimal("279.90"),
    },
]


class Command(BaseCommand):
    help = "Popula o banco com dados de showcase para cada plano e ofertas da semana."

    def add_arguments(self, parser):
        parser.add_argument("--limpar", action="store_true", help="Remove dados showcase antes de recriar.")

    @transaction.atomic
    def handle(self, *args, **options):
        from categorias.models import Categoria
        from usuarios.models import User
        from negocios.models import Negocio, Produto, Localizacao, RedesSociais
        from ofertas.models import Oferta

        emails = [s["email"] for s in SHOWCASE]

        if options["limpar"]:
            self.stdout.write("Removendo dados showcase existentes...")
            # Remove ofertas primeiro (FK cascade não inclui cross-app automaticamente)
            Oferta.objects.filter(negocio__usuario__email__in=emails).delete()
            User.objects.filter(email__in=emails).delete()
            self.stdout.write(self.style.WARNING("  Dados removidos.\n"))

        cat_map = {c.nome: c for c in Categoria.objects.filter(ativo=True)}

        self.stdout.write("Criando negócios showcase...\n")
        negocio_por_email: dict[str, Negocio] = {}

        for s in SHOWCASE:
            cat = cat_map.get(s["cat"])
            if not cat:
                # Tenta correspondência parcial
                cat = next((c for n, c in cat_map.items() if s["cat"].lower() in n.lower()), None)
            if not cat:
                self.stdout.write(self.style.WARNING(f"  ⚠ Categoria '{s['cat']}' não encontrada — pulando {s['nome']}"))
                continue

            user, user_criado = User.objects.get_or_create(
                email=s["email"],
                defaults={"nome": f"Demo {s['nome']}", "role": User.Role.COMERCIANTE, "is_active": True},
            )
            if user_criado:
                user.set_password("showcase1234")
                user.save(update_fields=["password"])

            negocio, neg_criado = Negocio.objects.get_or_create(
                usuario=user,
                defaults={
                    "nome":       s["nome"],
                    "descricao":  s["descricao"],
                    "historia":   s.get("historia", ""),
                    "categoria":  cat,
                    "cidade":     s["cidade"],
                    "whatsapp":   s["whatsapp"],
                    "plano":      s["plano"],
                    "status":     Negocio.Status.ATIVO,
                    "verificado": s["verificado"],
                    "horario_abertura":   s["horario"][0],
                    "horario_fechamento": s["horario"][1],
                    "dias_funcionamento": s["dias"],
                    "espaco_especial":    s.get("espaco_especial"),
                    "palavras_chave":     s["nome"],
                    "google_place_id":    s.get("google_place_id", ""),
                },
            )
            if not neg_criado and s.get("google_place_id"):
                negocio.google_place_id = s["google_place_id"]
                negocio.save(update_fields=["google_place_id"])
            negocio_por_email[s["email"]] = negocio

            if neg_criado:
                # Localização
                Localizacao.objects.get_or_create(
                    negocio=negocio,
                    defaults={
                        "logradouro": "Av. Centenário",
                        "numero":     "1.500",
                        "bairro":     "Centro",
                        "cidade":     s["cidade"],
                        "estado":     "SC",
                        "cep":        "88801-000",
                    },
                )

                # Redes sociais
                if s.get("redes"):
                    RedesSociais.objects.get_or_create(negocio=negocio, defaults=s["redes"])

                # Produtos
                for i, (nome_p, desc_p, preco_p) in enumerate(s["produtos"]):
                    Produto.objects.get_or_create(
                        negocio=negocio,
                        nome=nome_p,
                        defaults={
                            "descricao":    desc_p,
                            "preco":        preco_p,
                            "disponivel":   True,
                            "ordem":        i,
                            "confirmado_em": timezone.now(),
                        },
                    )

                plano_label = s["plano"].upper()
                self.stdout.write(f"  ✓ [{plano_label:10s}] {s['nome']} — {s['cidade']}")
            else:
                self.stdout.write(f"  · [{s['plano'].upper():10s}] {s['nome']} já existe — mantido")

        # ── Ofertas da Semana ──────────────────────────────────────────
        self.stdout.write("\nCriando Ofertas da Semana...\n")

        for o in OFERTAS:
            negocio = negocio_por_email.get(o["negocio_email"])
            if not negocio:
                self.stdout.write(self.style.WARNING(f"  ⚠ Negócio {o['negocio_email']} não encontrado — pulando oferta"))
                continue

            # Evita duplicar — verifica se já existe oferta ativa para este negócio com este título
            oferta_existente = Oferta.objects.filter(
                negocio=negocio,
                titulo=o["titulo"],
                status=Oferta.Status.ATIVA,
            ).first()

            if oferta_existente:
                self.stdout.write(f"  · Oferta '{o['titulo']}' já existe — mantida")
                continue

            oferta = Oferta.objects.create(
                negocio       = negocio,
                titulo        = o["titulo"],
                descricao     = o["descricao"],
                desconto_pct  = o.get("desconto_pct"),
                preco_original= o.get("preco_original"),
                preco_novo    = o.get("preco_novo"),
                valor_cobrado = Decimal("20.00"),
            )
            oferta.ativar(mp_payment_id="showcase_demo")
            self.stdout.write(f"  ✓ '{o['titulo']}' — {negocio.nome} ({negocio.plano})")

        # ── Mock reviews no Redis (showcase sem chave real de Places API) ──
        from django.core.cache import cache

        MOCK_REVIEWS: dict[str, dict] = {
            "showcase_pro_place_id": {
                "rating": 4.8,
                "total": 127,
                "url": "https://maps.google.com/",
                "reviews": [
                    {
                        "autor": "Ana Paula S.",
                        "foto": None,
                        "nota": 5,
                        "texto": "Atendimento impecável! Saí completamente transformada. A coloração ficou exatamente como eu queria, super natural. Já agendei o retorno!",
                        "tempo": "há 2 dias",
                    },
                    {
                        "autor": "Mariana C.",
                        "foto": None,
                        "nota": 5,
                        "texto": "Melhor salão de Criciúma! A coloração ficou perfeita e o ambiente é muito aconchegante. Profissionais super atenciosos. Super recomendo!",
                        "tempo": "há 1 semana",
                    },
                    {
                        "autor": "Fernanda L.",
                        "foto": None,
                        "nota": 4,
                        "texto": "Ótimo serviço, ambiente agradável e equipe qualificada. A hidratação deixou meu cabelo com muito mais brilho. Recomendo!",
                        "tempo": "há 2 semanas",
                    },
                ],
            },
            "showcase_fundador_place_id": {
                "rating": 4.9,
                "total": 312,
                "url": "https://maps.google.com/",
                "reviews": [
                    {
                        "autor": "Roberto M.",
                        "foto": None,
                        "nota": 5,
                        "texto": "A melhor massa fresca que já comi na vida! O fettuccine al tartufo é simplesmente incrível. Ambiente acolhedor que remete à Itália. Voltarei sempre!",
                        "tempo": "há 3 dias",
                    },
                    {
                        "autor": "Carla F.",
                        "foto": None,
                        "nota": 5,
                        "texto": "Uma experiência gastronômica única! O ossobuco alla milanese derrete na boca. Serviço impecável e a história da família Bianchi é muito emocionante.",
                        "tempo": "há 5 dias",
                    },
                    {
                        "autor": "Paulo H.",
                        "foto": None,
                        "nota": 5,
                        "texto": "Tradição e sabor incomparáveis. O tiramisù da Nonna Rosa é o melhor que já provei fora da Itália. Ambiente perfeito para jantares especiais.",
                        "tempo": "há 1 semana",
                    },
                ],
            },
        }

        ttl = 60 * 60 * 6  # 6h — alinhado com REVIEWS_CACHE_TTL em services.py
        for place_id, data in MOCK_REVIEWS.items():
            cache.set(f"google_reviews_{place_id}", data, ttl)
        self.stdout.write(f"\n  ✓ Mock reviews injetados no Redis ({len(MOCK_REVIEWS)} perfis)\n")

        # ── Resumo ─────────────────────────────────────────────────────
        total_neg    = Negocio.objects.filter(usuario__email__in=emails).count()
        total_prod   = Produto.objects.filter(negocio__usuario__email__in=emails).count()
        total_oferta = Oferta.objects.filter(negocio__usuario__email__in=emails, status=Oferta.Status.ATIVA).count()

        self.stdout.write("\n" + "─" * 52)
        self.stdout.write(self.style.SUCCESS("Showcase pronto!"))
        self.stdout.write(f"  Negócios: {total_neg}  |  Produtos: {total_prod}  |  Ofertas ativas: {total_oferta}")
        self.stdout.write("\nCredenciais (senha: showcase1234):")
        for s in SHOWCASE:
            self.stdout.write(f"  {s['plano']:10s} → {s['email']}")
        self.stdout.write("")
