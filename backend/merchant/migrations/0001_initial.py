from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("negocios", "0012_alter_negocio_plano"),
    ]

    operations = [
        migrations.CreateModel(
            name="SincronizacaoGMC",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("estado", models.CharField(
                    choices=[
                        ("sucesso", "Sucesso"),
                        ("warning", "Warning"),
                        ("erro", "Erro"),
                        ("deletado", "Deletado do GMC"),
                    ],
                    max_length=20,
                )),
                ("gmc_offer_id", models.CharField(blank=True, max_length=300)),
                ("mensagem_google", models.TextField(blank=True)),
                ("sincronizado_em", models.DateTimeField(auto_now=True)),
                ("criado_em", models.DateTimeField(auto_now_add=True)),
                ("produto", models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="sincronizacao_gmc",
                    to="negocios.produto",
                )),
            ],
            options={
                "verbose_name": "Sincronização GMC",
                "verbose_name_plural": "Sincronizações GMC",
                "indexes": [
                    models.Index(fields=["estado"], name="merchant_si_estado_f36b80_idx"),
                    models.Index(fields=["sincronizado_em"], name="merchant_si_sincron_974398_idx"),
                ],
            },
        ),
    ]
