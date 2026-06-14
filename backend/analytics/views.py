from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from datetime import date, timedelta
from django.db.models import Sum, Avg

from .models import Clique, MetricaDiaria
from .serializers import CliqueSerializer, MetricaDiariaSerializer
from negocios.permissions import IsPlanoPro


@method_decorator(ratelimit(key="ip", rate="60/m", method="POST", block=True), name="post")
class RegistrarCliqueView(generics.CreateAPIView):
    serializer_class   = CliqueSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED)


class MinhasMetricasView(generics.ListAPIView):
    serializer_class   = MetricaDiariaSerializer
    permission_classes = [IsAuthenticated, IsPlanoPro]

    def get_queryset(self):
        inicio = date.today() - timedelta(days=30)
        return MetricaDiaria.objects.filter(
            negocio=self.request.user.negocio,
            data__gte=inicio,
        ).order_by("data")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_metricas(request):
    """
    Dashboard completo do comerciante.
    Retorna resumo + grafico + origens + tabela dos ultimos 7 dias.
    Plano gratuito recebe preview com dados zerados + flag is_pro=False.
    """
    negocio = getattr(request.user, "negocio", None)
    if not negocio:
        return Response({"detail": "Negocio nao encontrado."}, status=404)

    # Plano gratuito — preview bloqueado
    if not negocio.is_pro:
        return Response({
            "is_pro": False,
            "plano": negocio.plano,
            "plano_display": negocio.get_plano_display(),
        })

    hoje  = date.today()
    inicio_30 = hoje - timedelta(days=29)
    inicio_7  = hoje - timedelta(days=6)

    metricas_30 = MetricaDiaria.objects.filter(
        negocio=negocio,
        data__gte=inicio_30,
    )

    # ─── Cards de resumo ──────────────────────────────────────────
    totais = metricas_30.aggregate(
        total_views=Sum("total_views"),
        total_whatsapp=Sum("total_whatsapp"),
        total_shares=Sum("total_shares"),
        origem_google=Sum("origem_google"),
        origem_instagram=Sum("origem_instagram"),
        origem_facebook=Sum("origem_facebook"),
        origem_whatsapp=Sum("origem_whatsapp"),
        origem_direto=Sum("origem_direto"),
    )

    total_views    = totais["total_views"] or 0
    total_whatsapp = totais["total_whatsapp"] or 0
    taxa_conversao = round((total_whatsapp / total_views) * 100, 1) if total_views else 0

    # ─── Grafico (30 dias) ────────────────────────────────────────
    grafico = list(
        metricas_30.order_by("data").values("data", "total_views", "total_whatsapp")
    )

    # ─── Origens ──────────────────────────────────────────────────
    total_origem = (
        (totais["origem_google"] or 0) +
        (totais["origem_instagram"] or 0) +
        (totais["origem_facebook"] or 0) +
        (totais["origem_whatsapp"] or 0) +
        (totais["origem_direto"] or 0)
    )

    def pct(valor):
        return round((valor or 0) / total_origem * 100) if total_origem else 0

    origens = [
        {"nome": "Google",    "emoji": "🔍", "valor": totais["origem_google"] or 0,    "pct": pct(totais["origem_google"])},
        {"nome": "Instagram", "emoji": "📸", "valor": totais["origem_instagram"] or 0, "pct": pct(totais["origem_instagram"])},
        {"nome": "Facebook",  "emoji": "👥", "valor": totais["origem_facebook"] or 0,  "pct": pct(totais["origem_facebook"])},
        {"nome": "WhatsApp",  "emoji": "💬", "valor": totais["origem_whatsapp"] or 0,  "pct": pct(totais["origem_whatsapp"])},
        {"nome": "Direto",    "emoji": "🔗", "valor": totais["origem_direto"] or 0,    "pct": pct(totais["origem_direto"])},
    ]
    origens = [o for o in origens if o["valor"] > 0]

    # ─── Tabela ultimos 7 dias ────────────────────────────────────
    tabela = list(
        MetricaDiaria.objects.filter(
            negocio=negocio,
            data__gte=inicio_7,
        ).order_by("-data").values(
            "data", "total_views", "total_whatsapp",
            "total_shares", "taxa_conversao"
        )
    )

    return Response({
        "is_pro": True,
        "plano_display": negocio.get_plano_display(),
        "resumo": {
            "total_views":    total_views,
            "total_whatsapp": total_whatsapp,
            "total_shares":   totais["total_shares"] or 0,
            "taxa_conversao": taxa_conversao,
        },
        "grafico": grafico,
        "origens": origens,
        "tabela":  tabela,
    })
