import logging
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Oferta
from .serializers import OfertaPublicaSerializer, OfertaPainelSerializer
from planos import services as mp_services

logger = logging.getLogger(__name__)

PLANOS_PAGOS = {"basico", "pro", "producao", "fundador"}


# ── Público ───────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def listar_ativas(request):
    """Retorna até 6 ofertas ativas ordenadas por publicação mais recente."""
    limit = min(int(request.query_params.get("limit", 3)), 6)
    ofertas = (
        Oferta.objects
        .filter(status=Oferta.Status.ATIVA, expira_em__gt=timezone.now())
        .select_related("negocio", "negocio__categoria")
        .order_by("-publicado_em")[:limit]
    )
    return Response(OfertaPublicaSerializer(ofertas, many=True).data)


# ── Painel do comerciante ─────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def minhas_ofertas(request):
    """Lista todas as ofertas do negócio autenticado."""
    negocio = getattr(request.user, "negocio", None)
    if negocio is None:
        return Response({"detail": "Negócio não encontrado."}, status=status.HTTP_404_NOT_FOUND)
    ofertas = Oferta.objects.filter(negocio=negocio).order_by("-criado_em")
    return Response(OfertaPainelSerializer(ofertas, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def criar_oferta(request):
    """
    Cria uma oferta e inicia o pagamento de R$20 via MercadoPago.
    Retorna { oferta_id, init_point } para o frontend redirecionar ao checkout.
    Exige plano pago.
    """
    negocio = getattr(request.user, "negocio", None)
    if negocio is None:
        return Response({"detail": "Negócio não encontrado."}, status=status.HTTP_404_NOT_FOUND)

    if negocio.plano not in PLANOS_PAGOS:
        return Response(
            {"detail": "Apenas negócios com plano pago podem publicar ofertas."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Limite: max 1 oferta ativa ou pendente por vez
    em_andamento = Oferta.objects.filter(
        negocio=negocio,
        status__in=[Oferta.Status.PENDENTE, Oferta.Status.ATIVA],
    ).exists()
    if em_andamento:
        return Response(
            {"detail": "Você já tem uma oferta ativa ou aguardando pagamento."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = OfertaPainelSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    oferta = serializer.save(negocio=negocio)

    back_url = request.data.get("back_url", "https://descubrasul.com/painel/ofertas")
    try:
        mp_data = mp_services.criar_preferencia_oferta(negocio, oferta.id, back_url)
    except Exception as exc:
        logger.error("Erro ao criar preferência MP oferta=%s: %s", oferta.id, exc)
        oferta.delete()
        return Response(
            {"detail": "Não foi possível iniciar o pagamento. Tente novamente."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    oferta.mp_preference_id = mp_data.get("id", "")
    oferta.save(update_fields=["mp_preference_id"])

    return Response({
        "oferta_id":  oferta.id,
        "init_point": mp_data.get("init_point"),
    }, status=status.HTTP_201_CREATED)


# ── Webhook MercadoPago ───────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def webhook_mp_oferta(request):
    """
    Recebe notificações de pagamento do MercadoPago (type='payment').
    Valida assinatura HMAC e ativa a oferta quando aprovado.
    Retorna 200 sempre para evitar reenvios do MP.
    """
    x_signature  = request.META.get("HTTP_X_SIGNATURE", "")
    x_request_id = request.META.get("HTTP_X_REQUEST_ID", "")
    payload  = request.data
    data_id  = payload.get("data", {}).get("id", "")

    if not mp_services.validar_assinatura_webhook(x_signature, x_request_id, data_id):
        logger.warning("Webhook oferta: assinatura inválida")
        return Response({"detail": "Assinatura inválida."}, status=status.HTTP_400_BAD_REQUEST)

    if payload.get("type") != "payment" or not data_id:
        return Response({"detail": "Evento ignorado."})

    payment = mp_services.buscar_pagamento_mp(data_id)
    if not payment:
        return Response({"detail": "OK"})

    mp_status       = payment.get("status")
    external_ref    = payment.get("external_reference", "")
    mp_payment_id   = str(payment.get("id", ""))

    if not external_ref.startswith("oferta-"):
        return Response({"detail": "Referência desconhecida."})

    try:
        oferta_id = int(external_ref.split("-", 1)[1])
        oferta    = Oferta.objects.get(pk=oferta_id, status=Oferta.Status.PENDENTE)
    except (ValueError, Oferta.DoesNotExist):
        logger.warning("Webhook oferta: oferta não encontrada ref=%s", external_ref)
        return Response({"detail": "OK"})

    if mp_status == "approved":
        oferta.ativar(mp_payment_id=mp_payment_id)
        logger.info("Oferta ativada: id=%s negocio=%s", oferta.id, oferta.negocio_id)

    return Response({"detail": "OK"})
