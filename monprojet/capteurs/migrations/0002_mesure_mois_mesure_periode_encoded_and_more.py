# Generated by Django 5.2.3 on 2025-06-30 13:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("capteurs", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="mesure",
            name="mois",
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name="mesure",
            name="periode_encoded",
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name="mesure",
            name="semaine_mois",
            field=models.IntegerField(default=1),
        ),
    ]
