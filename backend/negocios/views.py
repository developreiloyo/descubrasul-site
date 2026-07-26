from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import generics, viewsets, status
from rest_framework.decorators import api_view, permission_classes as deco_permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import models
from django.db.models import Case, When, Value, IntegerField, Prefetch
from django.contrib.postgres.search import SearchQuery
import unicodedata
from .models import Negocio, Produto
from .serializers import (
    NegocioPublicoSerializer, NegocioPainelSerializer,
    ProdutoPublicoSerializer, ProdutoPainelSerializer,
)
from .permissions import IsDonoDoNegocio, IsPlanoPro, PodicionarProduto
from .services import buscar_places_por_nome, buscar_reviews_google

PLAN_PRIORITY = Case(
    When(plano="fundador",  then=Value(1)),
    When(plano="producao",  then=Value(2)),
    When(plano="pro",       then=Value(3)),
    When(plano="basico",    then=Value(4)),
    default=Value(5),
    output_field=IntegerField(),
)


@method_decorator(cache_page(60 * 5), name="dispatch")
class NegocioListView(generics.ListAPIView):
    serializer_class   = NegocioPublicoSerializer
    permission_classes = [AllowAny]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ["verificado"]
    search_fields      = ["nome", "descricao", "palavras_chave"]
    ordering_fields    = ["atualizado_em"]

    def get_queryset(self):
        qs = Negocio.objects.filter(status=Negocio.Status.ATIVO).select_related(
            "categoria", "redes_sociais", "localizacao"
        ).prefetch_related("videos")
        categoria = self.request.query_params.get("categoria")
        if categoria:
            qs = qs.filter(categoria__slug=categoria)
        cidade = self.request.query_params.get("cidade")
        if cidade:
            cidade_norm = (
                unicodedata.normalize("NFKD", cidade.replace("-", " "))
                .encode("ASCII", "ignore")
                .decode()
                .strip()
            )
            qs = qs.filter(cidade__unaccent__iexact=cidade_norm)
        destaque = self.request.query_params.get("destaque")
        if destaque == "true":
            qs = qs.exclude(plano=Negocio.Plano.GRATUITO)
        return qs.annotate(plan_order=PLAN_PRIORITY).order_by("plan_order", "-verificado", "-atualizado_em")


@method_decorator(cache_page(60 * 10), name="dispatch")
class NegocioDetailView(generics.RetrieveAPIView):
    serializer_class   = NegocioPublicoSerializer
    permission_classes = [AllowAny]
    lookup_field       = "slug"

    def get_queryset(self):
        return Negocio.objects.filter(status=Negocio.Status.ATIVO).select_related(
            "categoria", "redes_sociais", "localizacao"
        ).prefetch_related("videos")


LIMITE_PRODUTOS_PUBLICO = {
    "gratuito": 10,
    "basico":   10,
}

class ProdutoListView(generics.ListAPIView):
    serializer_class   = ProdutoPublicoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        slug = self.kwargs["negocio_slug"]
        qs = Produto.objects.filter(
            negocio__slug=slug,
            negocio__status=Negocio.Status.ATIVO,
            disponivel=True,
        ).select_related("negocio", "negocio__categoria").prefetch_related("fotos").order_by("ordem", "criado_em")

        primeiro = qs.first()
        if primeiro is None:
            return qs.none()
        limite = LIMITE_PRODUTOS_PUBLICO.get(primeiro.negocio.plano)
        if limite is not None:
            return qs[:limite]
        return qs


@cache_page(60 * 5)
@api_view(["GET"])
@deco_permissions([AllowAny])
def produtos_destaque(request):
    """
    Retorna um produto por negócio, priorizando planos pagos (fundador > producao > pro > basico).
    Apenas produtos com foto e negócios ativos de plano pago.
    """
    try:
        limit = min(int(request.query_params.get("limit", 10)), 20)
    except (ValueError, TypeError):
        limit = 10

    PLANOS_PAGOS = [Negocio.Plano.FUNDADOR, Negocio.Plano.PRODUCAO, Negocio.Plano.PRO, Negocio.Plano.BASICO]

    negocios = (
        Negocio.objects.filter(status=Negocio.Status.ATIVO, plano__in=PLANOS_PAGOS)
        .select_related("categoria")
        .annotate(plan_order=PLAN_PRIORITY)
        .order_by("plan_order", "-verificado", "-atualizado_em")
        .prefetch_related(
            Prefetch(
                "produtos",
                queryset=Produto.objects.filter(disponivel=True)
                    .select_related("negocio", "negocio__categoria")
                    .prefetch_related("fotos")
                    .order_by(
                        # produtos com foto primeiro, depois por ordem definida pelo comerciante
                        Case(When(foto__isnull=False, then=Value(0)), default=Value(1), output_field=IntegerField()),
                        Case(When(foto="", then=Value(1)), default=Value(0), output_field=IntegerField()),
                        "ordem",
                        "criado_em",
                    ),
                to_attr="produtos_priorizados",
            )
        )
    )

    result = []
    for negocio in negocios:
        if negocio.produtos_priorizados:
            result.append(negocio.produtos_priorizados[0])
        if len(result) >= limit:
            break

    serializer = ProdutoPublicoSerializer(result, many=True)
    return Response(serializer.data)


class MeuNegocioView(generics.RetrieveUpdateAPIView):
    serializer_class   = NegocioPainelSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return (
            Negocio.objects
            .select_related("categoria", "localizacao", "redes_sociais")
            .get(usuario=self.request.user)
        )


@api_view(["POST"])
@deco_permissions([IsAuthenticated])
def buscar_google(request):
    """Busca candidatos no Google Places pelo nome + cidade do negócio."""
    negocio = request.user.negocio
    query   = request.data.get("query", "").strip()
    nome    = query or negocio.nome
    cidade  = negocio.cidade
    candidatos = buscar_places_por_nome(nome, cidade)
    if not candidatos:
        return Response({"detail": "Nenhum resultado encontrado."}, status=404)
    return Response(candidatos)


@api_view(["GET"])
@deco_permissions([AllowAny])
def reviews_google(request, slug):
    """Retorna rating e reviews do Google Places para um negócio. Cache 6h."""
    try:
        negocio = Negocio.objects.only("google_place_id", "status").get(
            slug=slug, status=Negocio.Status.ATIVO
        )
    except Negocio.DoesNotExist:
        return Response({"detail": "Negócio não encontrado."}, status=404)

    if not negocio.google_place_id:
        return Response(None)

    data = buscar_reviews_google(negocio.google_place_id)
    return Response(data)


class MeusProdutosViewSet(viewsets.ModelViewSet):
    serializer_class   = ProdutoPainelSerializer
    permission_classes = [IsAuthenticated, IsDonoDoNegocio, PodicionarProduto]

    def perform_create(self, serializer):
        from django.utils import timezone
        # disponivel e confirmado_em definidos pelo backend:
        # DRF interpreta boolean ausente em multipart como False
        serializer.save(
            negocio=self.request.user.negocio,
            disponivel=True,
            confirmado_em=timezone.now(),
        )

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
    
    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def tipos_sugeridos(self, request):
        """
        Retorna até 30 valores distintos de tipo_produto já cadastrados
        para a categoria informada, usados como autocomplete no painel.

        GET /api/negocios/painel/produtos/tipos_sugeridos/?categoria=<slug>

        Não expõe PII — devolve apenas strings de tipo_produto que já
        passaram por validar_texto_seo_completo ao serem salvas.
        Endpoint público: sugestões não contêm dados sensíveis.
        """
        categoria_slug = request.query_params.get("categoria", "").strip()
        if not categoria_slug:
            return Response({"sugerencias": []})

        sugerencias = list(
            Produto.objects.filter(
                tipo_produto__isnull=False,
                negocio__categoria__slug=categoria_slug,
            )
            .exclude(tipo_produto="")
            .values_list("tipo_produto", flat=True)
            .distinct()
            .order_by("tipo_produto")[:30]
        )
        return Response({"sugerencias": sugerencias})

    @action(detail=True, methods=["post"], url_path="fotos")
    def adicionar_foto(self, request, pk=None):
        """Adiciona foto ao produto — máximo 3."""
        produto = self.get_object()

        fotos_count = produto.fotos.count()
        if fotos_count >= 3:
            return Response(
                {"detail": "Máximo de 3 fotos por produto atingido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        foto = request.FILES.get("foto")
        if not foto:
            return Response({"detail": "Foto obrigatória."}, status=400)

        from .validators import validar_imagem
        validar_imagem(foto)

        from .models import FotoProduto
        FotoProduto.objects.create(
            produto=produto,
            foto=foto,
            alt_texto=request.data.get("alt_texto", ""),
            ordem=fotos_count,
        )
        return Response({"ok": True}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"], url_path="fotos/(?P<foto_id>[^/.]+)")
    def remover_foto(self, request, pk=None, foto_id=None):
        """Remove uma foto específica do produto."""
        from .models import FotoProduto
        produto = self.get_object()
        try:
            foto = FotoProduto.objects.get(id=foto_id, produto=produto)
            foto.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except (FotoProduto.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "Foto não encontrada."}, status=404)
        
    def get_queryset(self):
        return Produto.objects.filter(
            negocio=self.request.user.negocio
        ).order_by("ordem", "criado_em").prefetch_related("fotos")

    @action(detail=True, methods=["post"], url_path="destacar")
    def destacar(self, request, pk=None):
        """Move este produto para a posição 0 — aparece no carousel principal."""
        produto = self.get_object()
        negocio = self.request.user.negocio

        # Incrementa a ordem de todos os outros
        Produto.objects.filter(negocio=negocio).exclude(pk=produto.pk).update(
            ordem=models.F("ordem") + 1
        )
        produto.ordem = 0
        produto.save(update_fields=["ordem"])

        return Response({"ok": True})
