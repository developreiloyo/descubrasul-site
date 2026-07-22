from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("negocios", "0009_remove_negocio_media_nota_total_avaliacoes"),
    ]

    operations = [
        migrations.AddField(
            model_name="negocio",
            name="google_place_id",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
    ]
