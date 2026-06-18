from django.db import migrations
from django.contrib.postgres.operations import UnaccentExtension
import unicodedata


def normalizar_cidade(text: str) -> str:
    """Criciúma → Criciuma, criciuma → Criciuma, CRICIUMA → Criciuma"""
    sem_acento = unicodedata.normalize("NFKD", text).encode("ASCII", "ignore").decode()
    return sem_acento.strip().title()


def normalizar_cidades_existentes(apps, schema_editor):
    Negocio = apps.get_model("negocios", "Negocio")
    for n in Negocio.objects.all():
        nova = normalizar_cidade(n.cidade)
        if nova != n.cidade:
            Negocio.objects.filter(pk=n.pk).update(cidade=nova)


class Migration(migrations.Migration):

    dependencies = [
        ("negocios", "0005_espaco_especial"),
    ]

    operations = [
        UnaccentExtension(),
        migrations.RunPython(
            normalizar_cidades_existentes,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
