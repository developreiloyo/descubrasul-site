import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import CATALOGO_PLANOS, Assinatura
from .serializers import AssinaturaSerializer
from . import services

logger = logging.getLogger(__name__)

_PLANOS_PUBLICOS = [
    {
        "slug":     "gratuito",
        "nome":     "Gratuito",
        "valor":    "0.00",
        "periodo":  "para sempre",
        "descricao": "Vitrina básica com até 5 produtos",
    },
] + [
    {
        "slug":     slug,
        "nome":     info["nome"],
        "valor":    str(info["valor"]),
        "periodo":  info["periodo"],
        "descricao": info["descricao"],
    }
    for slug, info in CATALOGO_PLANOS.items()
]


@api_view(["GET"])
@permission_classes([AllowAny])
def listar_planos(request):
    """Public: list all plans with pricing."""
    return Response(_PLANOS_PUBLICOS)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def minha_assinatura(request):
    """Return current user's subscription status."""
    negocio = getattr(request.user, "negocio", None)
    if negocio is None:
        return Response({"detail": "Negócio não encontrado."}, status=status.HTTP_404_NOT_FOUND)

    try:
        return Response(AssinaturaSerializer(negocio.assinatura).data)
    except Assinatura.DoesNotExist:
        return Response({
            "plano":              negocio.plano,
            "plano_display":      negocio.get_plano_display(),
            "status":             "sem_assinatura",
            "mp_subscription_id": None,
            "proximo_vencimento": None,
            "cancelado_em":       None,
            "criado_em":          None,
        })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def assinar_plano(request, plano_slug):
    """
    Initiates a Mercado Pago recurring subscription.
    Returns: { "init_point": "https://..." }
    """
    if plano_slug not in CATALOGO_PLANOS:
        return Response({"detail": "Plano inválido."}, status=status.HTTP_400_BAD_REQUEST)

    negocio = getattr(request.user, "negocio", None)
    if negocio is None:
        return Response({"detail": "Negócio não encontrado."}, status=status.HTTP_404_NOT_FOUND)

    back_url = request.data.get(
        "back_url",
        "https://descubrasul.com/painel/meu-negocio",
    )

    try:
        mp_data = services.criar_subscricao_mp(negocio, plano_slug, back_url)
    except Exception as exc:
        logger.error("Erro ao criar assinatura MP negocio=%s: %s", negocio.pk, exc)
        return Response(
            {"detail": "Não foi possível iniciar o pagamento. Tente novamente em instantes."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    mp_id = mp_data.get("id", "")
    assinatura, _ = Assinatura.objects.get_or_create(
        negocio=negocio,
        defaults={"plano": plano_slug, "mp_subscription_id": mp_id},
    )
    assinatura.plano              = plano_slug
    assinatura.status             = Assinatura.Status.PENDENTE
    assinatura.mp_subscription_id = mp_id
    assinatura.save()

    return Response({
        "init_point":        mp_data.get("init_point"),
        "mp_subscription_id": mp_id,
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def webhook_mp(request):
    """
    Mercado Pago webhook — receives preapproval (subscription) status changes.
    Endpoint is public but validated via HMAC-SHA256 signature.
    Always returns 200 to MP to prevent retries on business logic errors.
    """
    x_signature  = request.META.get("HTTP_X_SIGNATURE", "")
    x_request_id = request.META.get("HTTP_X_REQUEST_ID", "")

    payload = request.data
    data_id = payload.get("data", {}).get("id", "")

    if not services.validar_assinatura_webhook(x_signature, x_request_id, data_id):
        logger.warning("Webhook MP: assinatura inválida x_request_id=%s", x_request_id)
        return Response({"detail": "Assinatura inválida."}, status=status.HTTP_400_BAD_REQUEST)

    event_type = payload.get("type", "")
    if event_type != "subscription_preapproval" or not data_id:
        return Response({"detail": "Evento ignorado."})

    mp_data = services.buscar_subscricao_mp(data_id)
    if not mp_data:
        logger.error("Webhook MP: falha ao consultar preapproval id=%s", data_id)
        return Response({"detail": "OK"})  # 200 to avoid MP retries

    mp_status = mp_data.get("status")

    try:
        assinatura = Assinatura.objects.select_related("negocio").get(
            mp_subscription_id=data_id
        )
    except Assinatura.DoesNotExist:
        logger.warning("Webhook MP: assinatura não encontrada id=%s", data_id)
        return Response({"detail": "OK"})

    negocio = assinatura.negocio

    if mp_status == "authorized":
        services.ativar_plano(negocio, assinatura.plano, data_id)
    elif mp_status == "cancelled":
        services.cancelar_plano(negocio, Assinatura.Status.CANCELADA)
    elif mp_status == "paused":
        services.cancelar_plano(negocio, Assinatura.Status.PAUSADA)
    else:
        logger.info("Webhook MP: status não tratado '%s' id=%s", mp_status, data_id)

    return Response({"detail": "OK"})
