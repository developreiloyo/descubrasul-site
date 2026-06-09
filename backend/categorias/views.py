from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Categoria
from .serializers import CategoriaSerializer


class CategoriaListView(generics.ListAPIView):
    queryset = Categoria.objects.filter(ativo=True)
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]
