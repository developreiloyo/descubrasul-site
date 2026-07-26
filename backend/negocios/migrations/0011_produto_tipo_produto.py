from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("negocios", "0010_negocio_google_place_id"),
    ]

    operations = [
        migrations.AddField(
            model_name="produto",
            name="tipo_produto",
            field=models.CharField(blank=True, max_length=120, null=True),
        ),
    ]
