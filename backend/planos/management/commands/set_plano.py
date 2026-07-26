from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone


class Command(BaseCommand):
    help = "Manually set a business plan (operator use only — bypasses payment)"

    def add_arguments(self, parser):
        parser.add_argument("email", type=str, help="Comerciante email")
        parser.add_argument(
            "plano",
            type=str,
            help="Plan slug: gratuito | pro (Conexão Sul) | producao (Destaque Sul)",
        )

    def handle(self, *args, **options):
        from usuarios.models import User
        from planos.models import Assinatura, CATALOGO_PLANOS

        email      = options["email"]
        plano_slug = options["plano"]

        valid = list(CATALOGO_PLANOS.keys()) + ["gratuito"]
        if plano_slug not in valid:
            raise CommandError(f"Plano inválido. Opções: {', '.join(valid)}")

        try:
            user = User.objects.select_related("negocio").get(email=email)
        except User.DoesNotExist:
            raise CommandError(f"Usuário '{email}' não encontrado.")

        negocio = getattr(user, "negocio", None)
        if negocio is None:
            raise CommandError(f"Usuário '{email}' não tem negócio associado.")

        plano_anterior = negocio.plano
        negocio.plano  = plano_slug
        negocio.save(update_fields=["plano"])

        if plano_slug == "gratuito":
            Assinatura.objects.filter(negocio=negocio).update(
                status=Assinatura.Status.ENCERRADA,
                cancelado_em=timezone.now(),
            )
        else:
            assinatura, created = Assinatura.objects.get_or_create(
                negocio=negocio,
                defaults={"plano": plano_slug, "status": Assinatura.Status.ATIVA},
            )
            if not created:
                assinatura.plano  = plano_slug
                assinatura.status = Assinatura.Status.ATIVA
                assinatura.save(update_fields=["plano", "status", "atualizado_em"])

        self.stdout.write(
            self.style.SUCCESS(
                f"OK: '{negocio.nome}' {plano_anterior} → {plano_slug}"
            )
        )
