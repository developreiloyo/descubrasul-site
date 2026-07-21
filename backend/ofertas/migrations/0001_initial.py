from decimal import Decimal
import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("negocios", "0009_remove_negocio_media_nota_total_avaliacoes"),
    ]

    operations = [
        migrations.CreateModel(
            name="Oferta",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("negocio", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ofertas", to="negocios.negocio")),
                ("titulo",         models.CharField(max_length=80)),
                ("descricao",      models.TextField()),
                ("desconto_pct",   models.PositiveIntegerField(blank=True, null=True)),
                ("preco_original", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("preco_novo",     models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("imagem",         models.ImageField(blank=True, null=True, upload_to="ofertas/")),
                ("status",         models.CharField(choices=[("pendente","Aguardando pagamento"),("ativa","Ativa"),("expirada","Expirada"),("cancelada","Cancelada")], db_index=True, default="pendente", max_length=20)),
                ("valor_cobrado",    models.DecimalField(decimal_places=2, default=Decimal("20.00"), max_digits=6)),
                ("mp_preference_id", models.CharField(blank=True, db_index=True, max_length=100)),
                ("mp_payment_id",    models.CharField(blank=True, db_index=True, max_length=100)),
                ("criado_em",    models.DateTimeField(auto_now_add=True)),
                ("publicado_em", models.DateTimeField(blank=True, null=True)),
                ("expira_em",    models.DateTimeField(blank=True, db_index=True, null=True)),
            ],
            options={
                "verbose_name": "Oferta da Semana",
                "verbose_name_plural": "Ofertas da Semana",
                "ordering": ["-publicado_em", "-criado_em"],
            },
        ),
        migrations.AddIndex(
            model_name="oferta",
            index=models.Index(fields=["status", "expira_em"], name="ofertas_status_expira_idx"),
        ),
        migrations.AddIndex(
            model_name="oferta",
            index=models.Index(fields=["negocio", "status"], name="ofertas_negocio_status_idx"),
        ),
    ]
