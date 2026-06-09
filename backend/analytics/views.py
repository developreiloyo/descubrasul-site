from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from datetime import date, timedelta

from .models import Clique, MetricaDiaria
from .serializers import CliqueSerializer, MetricaDiariaSerializer
from negocios.permissions import IsPlanoPro


@method_decorator(ratelimit(key="ip", rate="60/m", method="POST", block=True), name="post")
class RegistrarCliqueView(generics.CreateAPIView):
    """
    Endpoint publico para registrar interacoes do visitante.
    Rate limit por IP: 60/min - protege contra inflacao de metricas.
    """
    serializer_class   = CliqueSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED)


class MinhasMetricasView(generics.ListAPIView):
    """
    Dashboard do comerciante - ultimos 30 dias.
    Exclusivo Plano Pro (feature paga).
    """
    serializer_class   = MetricaDiariaSerializer
    permission_classes = [IsAuthenticated, IsPlanoPro]

    def get_queryset(self):
        inicio = date.today() - timedelta(days=30)
        return MetricaDiaria.objects.filter(
            negocio=self.request.user.negocio,
            data__gte=inicio,
        ).order_by("data")
