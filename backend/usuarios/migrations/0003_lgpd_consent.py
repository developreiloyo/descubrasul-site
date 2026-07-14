from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("usuarios", "0002_add_reset_token_version"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="lgpd_consent",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="user",
            name="consent_date",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
