from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Negocio, Produto
from .serializers import (
    NegocioPublicoSerializer, NegocioPainelSerializer,
    ProdutoPublicoSerializer, ProdutoPainelSerializer,
)
from .permissions import IsDonoDoNegocio, IsPlanoPro, PodicionarProduto


class NegocioListView(generics.ListAPIView):
    serializer_class   = NegocioPublicoSerializer
    permission_classes = [AllowAny]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ["cidade", "verificado"]
    search_fields      = ["nome", "descricao", "palavras_chave"]
    ordering_fields    = ["atualizado_em", "media_nota"]

    def get_queryset(self):
        qs = Negocio.objects.filter(status=Negocio.Status.ATIVO).select_related(
            "categoria", "redes_sociais", "localizacao"
        ).prefetch_related("videos")
        categoria = self.request.query_params.get("categoria")
        if categoria:
            qs = qs.filter(categoria__slug=categoria)
        destaque = self.request.query_params.get("destaque")
        if destaque == "true":
            qs = qs.exclude(plano=Negocio.Plano.GRATUITO)
        return qs.order_by("-verificado", "plano", "-atualizado_em")


class NegocioDetailView(generics.RetrieveAPIView):
    serializer_class   = NegocioPublicoSerializer
    permission_classes = [AllowAny]
    lookup_field       = "slug"

    def get_queryset(self):
        return Negocio.objects.filter(status=Negocio.Status.ATIVO).select_related(
            "categoria", "redes_sociais", "localizacao"
        ).prefetch_related("videos")


class ProdutoListView(generics.ListAPIView):
    serializer_class   = ProdutoPublicoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Produto.objects.filter(
            negocio__slug=self.kwargs["negocio_slug"],
            negocio__status=Negocio.Status.ATIVO,
            disponivel=True,
        ).select_related("negocio")


class MeuNegocioView(generics.RetrieveUpdateAPIView):
    serializer_class   = NegocioPainelSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.negocio


class MeusProdutosViewSet(viewsets.ModelViewSet):
    serializer_class   = ProdutoPainelSerializer
    permission_classes = [IsAuthenticated, IsDonoDoNegocio, PodicionarProduto]

    def get_queryset(self):
        return Produto.objects.filter(negocio__usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(negocio=self.request.user.negocio)

    @action(detail=True, methods=["post"])
    def confirmar_disponibilidade(self, request, pk=None):
        from django.utils import timezone
        produto = self.get_object()
        produto.disponivel    = True
        produto.confirmado_em = timezone.now()
        produto.save(update_fields=["disponivel", "confirmado_em"])
        return Response({"status": "confirmado"})

    @action(detail=False, methods=["get"])
    def status_plano(self, request):
        negocio = request.user.negocio
        total   = negocio.produtos.filter(disponivel=True).count()
        limite  = negocio.limite_produtos
        return Response({
            "plano":               negocio.plano,
            "plano_display":       negocio.get_plano_display(),
            "is_pro":              negocio.is_pro,
            "is_pago":             negocio.is_pago,
            "produtos_ativos":     total,
            "limite_produtos":     limite,
            "pode_adicionar":      negocio.pode_adicionar_produto,
            "aparece_em_destaque": negocio.aparece_em_destaque,
        })
