# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-06-11 15:09
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cartoon', '0004_auto_20160611_1500'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cartoon',
            name='username',
            field=models.CharField(max_length=50),
        ),
    ]
