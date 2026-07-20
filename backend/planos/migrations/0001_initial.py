from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("negocios", "0008_redesociais_linkedin"),
    ]

    operations = [
        migrations.CreateModel(
            name="Assinatura",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "negocio",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="assinatura",
                        to="negocios.negocio",
                    ),
                ),
                ("plano", models.CharField(max_length=20)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pendente",  "Aguardando autorização"),
                            ("ativa",     "Ativa"),
                            ("pausada",   "Pausada"),
                            ("cancelada", "Cancelada"),
                            ("encerrada", "Encerrada"),
                        ],
                        default="pendente",
                        max_length=20,
                    ),
                ),
                ("mp_subscription_id", models.CharField(blank=True, db_index=True, max_length=100)),
                ("proximo_vencimento", models.DateTimeField(blank=True, null=True)),
                ("cancelado_em",       models.DateTimeField(blank=True, null=True)),
                ("criado_em",          models.DateTimeField(auto_now_add=True)),
                ("atualizado_em",      models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name":        "Assinatura",
                "verbose_name_plural": "Assinaturas",
            },
        ),
        migrations.AddIndex(
            model_name="assinatura",
            index=models.Index(fields=["status"], name="planos_assi_status_idx"),
        ),
        migrations.AddIndex(
            model_name="assinatura",
            index=models.Index(fields=["cancelado_em"], name="planos_assi_cancel_idx"),
        ),
    ]
