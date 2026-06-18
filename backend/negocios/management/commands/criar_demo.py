"""
Cria um usuario demo completo para testar o dashboard.

Uso:
    python manage.py criar_demo
    python manage.py criar_demo --resetar   # recria do zero
"""

import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone


CREDENCIAIS = {
    "email": "demo@descubrasul.dev",
    "senha": "Demo@1234",
}


class Command(BaseCommand):
    help = "Cria perfil demo com plano Pro e 30 dias de metricas para testar o dashboard."

    def add_arguments(self, parser):
        parser.add_argument(
            "--resetar",
            action="store_true",
            help="Remove e recria o usuario demo do zero.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        from categorias.models import Categoria
        from usuarios.models import User
        from negocios.models import Negocio, Produto, Localizacao, RedesSociais
        from analytics.models import MetricaDiaria

        email = CREDENCIAIS["email"]
        senha = CREDENCIAIS["senha"]

        if options["resetar"]:
            User.objects.filter(email=email).delete()
            self.stdout.write(self.style.WARNING("Usuario demo removido."))

        # ── Categoria ──────────────────────────────────────────────────
        cat, _ = Categoria.objects.get_or_create(
            nome="Restaurantes",
            defaults={"icone": "🍽️", "schema_tipo": "Restaurant", "ordem": 1},
        )

        # ── Usuario ────────────────────────────────────────────────────
        user, user_criado = User.objects.get_or_create(
            email=email,
            defaults={
                "nome":     "Demo DescubraSul",
                "role":     User.Role.COMERCIANTE,
                "is_active": True,
            },
        )
        if user_criado:
            user.set_password(senha)
            user.save(update_fields=["password"])

        # ── Negocio Pro ────────────────────────────────────────────────
        negocio, neg_criado = Negocio.objects.get_or_create(
            usuario=user,
            defaults={
                "nome":      "Cantina Demo Sul",
                "descricao": "Culinaria italiana artesanal no sul de Santa Catarina.",
                "categoria": cat,
                "cidade":    "Criciuma",
                "whatsapp":  "48999990001",
                "plano":     Negocio.Plano.PRO,
                "status":    Negocio.Status.ATIVO,
                "verificado": True,
                "media_nota": 4.8,
                "total_avaliacoes": 143,
                "horario_abertura":   "11:00:00",
                "horario_fechamento": "23:00:00",
                "dias_funcionamento": ["seg", "ter", "qua", "qui", "sex", "sab"],
                "seo_title":       "Cantina Demo Sul em Criciuma | DescubraSul",
                "seo_description": "Culinaria italiana artesanal no sul catarinense.",
            },
        )

        if neg_criado:
            Localizacao.objects.create(
                negocio=negocio,
                direccao="Av. Centenario, 1500",
                bairro="Centro",
                cidade="Criciuma",
                estado="SC",
                cep="88801-000",
            )

            RedesSociais.objects.create(
                negocio=negocio,
                instagram_url="https://instagram.com/cantinademosul",
                facebook_url="https://facebook.com/cantinademosul",
            )

            Produto.objects.bulk_create([
                Produto(
                    negocio=negocio,
                    nome="Fettuccine ao Funghi",
                    descricao="Massa fresca com cogumelos frescos e parmesao.",
                    preco=79.90,
                    disponivel=True,
                    confirmado_em=timezone.now(),
                ),
                Produto(
                    negocio=negocio,
                    nome="Lasanha da Casa",
                    descricao="Lasanha bolonhesa com bechamel artesanal.",
                    preco=69.90,
                    disponivel=True,
                    confirmado_em=timezone.now(),
                ),
                Produto(
                    negocio=negocio,
                    nome="Tiramisu",
                    descricao="Sobremesa italiana classica com mascarpone.",
                    preco=29.90,
                    disponivel=True,
                    confirmado_em=timezone.now(),
                ),
            ])

        # ── 30 dias de metricas ────────────────────────────────────────
        hoje = date.today()
        metricas_criadas = 0

        for d in range(30):
            dia   = hoje - timedelta(days=d)
            views = max(10, 85 + random.randint(-20, 35))
            whats = max(0, int(views * random.uniform(0.06, 0.18)))
            shares = max(0, int(views * random.uniform(0.01, 0.05)))

            _, created = MetricaDiaria.objects.get_or_create(
                negocio=negocio,
                data=dia,
                defaults={
                    "total_views":       views,
                    "total_whatsapp":    whats,
                    "total_shares":      shares,
                    "total_produto":     int(views * random.uniform(0.20, 0.45)),
                    "origem_google":     int(views * random.uniform(0.30, 0.45)),
                    "origem_instagram":  int(views * random.uniform(0.15, 0.28)),
                    "origem_facebook":   int(views * random.uniform(0.05, 0.12)),
                    "origem_whatsapp":   int(views * random.uniform(0.04, 0.08)),
                    "origem_direto":     int(views * random.uniform(0.08, 0.18)),
                    "cliques_instagram": int(views * random.uniform(0.05, 0.15)),
                    "cliques_maps":      int(views * random.uniform(0.02, 0.10)),
                    "taxa_conversao":    round((whats / views) * 100, 2) if views else 0,
                },
            )
            if created:
                metricas_criadas += 1

        # ── Resumo ─────────────────────────────────────────────────────
        self.stdout.write("\n" + "─" * 48)
        self.stdout.write(self.style.SUCCESS("Perfil demo pronto!"))
        self.stdout.write(f"  Email : {email}")
        self.stdout.write(f"  Senha : {senha}")
        self.stdout.write(f"  Plano : Pro (dashboard completo)")
        self.stdout.write(f"  Negocio: {negocio.nome} — {negocio.cidade}")
        self.stdout.write(f"  Metricas: {metricas_criadas} dia(s) criado(s)")
        self.stdout.write("─" * 48 + "\n")
