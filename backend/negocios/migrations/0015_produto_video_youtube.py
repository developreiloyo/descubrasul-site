from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('negocios', '0014_foto_negocio'),
    ]

    operations = [
        migrations.AddField(
            model_name='produto',
            name='video_youtube_url',
            field=models.URLField(blank=True, default=''),
        ),
    ]
