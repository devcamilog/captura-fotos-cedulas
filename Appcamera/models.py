from django.db import models

# Create your models here.

class Cedulas(models.Model):
    cedula = models.IntegerField()