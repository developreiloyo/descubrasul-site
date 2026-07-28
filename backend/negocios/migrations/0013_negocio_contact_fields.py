from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('negocios', '0012_alter_negocio_plano'),
    ]

    operations = [
        migrations.AddField(
            model_name='negocio',
            name='telefone',
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AddField(
            model_name='negocio',
            name='email_contato',
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name='negocio',
            name='nome_responsavel',
            field=models.CharField(blank=True, max_length=200),
        ),
    ]
