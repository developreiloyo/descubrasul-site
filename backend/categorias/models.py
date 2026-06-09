from django.db import models
from django.utils.text import slugify
from django.db.models.signals import pre_save
from django.dispatch import receiver


class Categoria(models.Model):
    slug        = models.SlugField(max_length=100, unique=True, blank=True)
    nome        = models.CharField(max_length=100)
    icone       = models.CharField(max_length=10, blank=True)
    schema_tipo = models.CharField(max_length=50, blank=True)
    ativo       = models.BooleanField(default=True)
    ordem       = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name        = "Categoria"
        verbose_name_plural = "Categorias"
        ordering            = ["ordem", "nome"]

    def __str__(self):
        return self.nome


@receiver(pre_save, sender=Categoria)
def gerar_slug_categoria(sender, instance, **kwargs):
    if not instance.slug:
        instance.slug = slugify(instance.nome)
