from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from core.constants import CIDADES_ATENDIDAS
from rest_framework.throttling import AnonRateThrottle


@api_view(["GET"])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def listar_cidades(request):
    """Returns the fixed list of cities served by DescubraSul."""
    data = [{"slug": slug, "nome": nome} for slug, nome in CIDADES_ATENDIDAS]
    return Response(data)
