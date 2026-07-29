from django.db import migrations, models
import django.db.models.deletion
import negocios.models


class Migration(migrations.Migration):

    dependencies = [
        ('negocios', '0013_negocio_contact_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='FotoNegocio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('foto', models.ImageField(upload_to=negocios.models.gerar_caminho_seguro)),
                ('alt_texto', models.CharField(blank=True, max_length=125)),
                ('ordem', models.PositiveSmallIntegerField(default=0)),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
                ('negocio', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='fotos_galeria',
                    to='negocios.negocio',
                )),
            ],
            options={
                'verbose_name': 'Foto da Galeria',
                'verbose_name_plural': 'Fotos da Galeria',
                'ordering': ['ordem', '-criado_em'],
            },
        ),
    ]
