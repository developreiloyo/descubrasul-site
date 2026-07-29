from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Categoria
from .serializers import CategoriaSerializer


@method_decorator(cache_page(60 * 60), name="dispatch")
class CategoriaListView(generics.ListAPIView):
    queryset = Categoria.objects.filter(ativo=True).order_by("ordem")
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]
    pagination_class = None
