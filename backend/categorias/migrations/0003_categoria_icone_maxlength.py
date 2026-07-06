from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("categorias", "0002_seed_categorias"),
    ]

    operations = [
        migrations.AlterField(
            model_name="categoria",
            name="icone",
            field=models.CharField(blank=True, max_length=50),
        ),
    ]
