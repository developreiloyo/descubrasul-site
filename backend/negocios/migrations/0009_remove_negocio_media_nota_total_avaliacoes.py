from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("negocios", "0008_redesociais_linkedin"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="negocio",
            name="media_nota",
        ),
        migrations.RemoveField(
            model_name="negocio",
            name="total_avaliacoes",
        ),
    ]
