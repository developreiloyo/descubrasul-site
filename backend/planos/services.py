import hashlib
import hmac
import logging

import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .models import Assinatura, CATALOGO_PLANOS

logger = logging.getLogger(__name__)

MP_API_BASE = "https://api.mercadopago.com"


def _mp_headers(idempotency_key=""):
    headers = {
        "Authorization": f"Bearer {settings.MP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    if idempotency_key:
        headers["X-Idempotency-Key"] = idempotency_key
    return headers


def criar_subscricao_mp(negocio, plano_slug, back_url):
    """
    Creates a Mercado Pago preapproval (recurring subscription).
    Returns the full MP response dict. Raises requests.RequestException on failure.
    """
    if plano_slug not in CATALOGO_PLANOS:
        raise ValueError(f"Plano inválido: {plano_slug}")

    config = CATALOGO_PLANOS[plano_slug]

    payload = {
        "reason": f"DescubraSul {config['nome']}",
        "auto_recurring": {
            "frequency":          config["frequencia"],
            "frequency_type":     "months",
            "transaction_amount": float(config["valor"]),
            "currency_id":        "BRL",
        },
        "back_url":    back_url,
        "payer_email": negocio.usuario.email,
        "status":      "pending",
    }

    # Use negocio pk + plano as idempotency key to prevent duplicate subscriptions
    idempotency_key = f"sub-{negocio.pk}-{plano_slug}"

    try:
        resp = requests.post(
            f"{MP_API_BASE}/preapproval",
            json=payload,
            headers=_mp_headers(idempotency_key),
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as exc:
        logger.error("MP create subscription failed for negocio=%s: %s", negocio.pk, exc)
        raise


def criar_preferencia_oferta(negocio, oferta_id, back_url):
    """
    Creates a MercadoPago one-time payment preference for R$20 Oferta da Semana.
    Returns the full MP response dict. Raises requests.RequestException on failure.
    """
    payload = {
        "items": [{
            "title":      "Oferta da Semana — DescubraSul",
            "quantity":   1,
            "unit_price": 20.00,
            "currency_id": "BRL",
        }],
        "back_urls": {
            "success": f"{back_url}?oferta_status=success&oferta_id={oferta_id}",
            "failure": f"{back_url}?oferta_status=failure&oferta_id={oferta_id}",
            "pending": f"{back_url}?oferta_status=pending&oferta_id={oferta_id}",
        },
        "auto_return":        "approved",
        "external_reference": f"oferta-{oferta_id}",
        "payer": {"email": negocio.usuario.email},
    }
    idempotency_key = f"oferta-{oferta_id}"
    try:
        resp = requests.post(
            f"{MP_API_BASE}/checkout/preferences",
            json=payload,
            headers=_mp_headers(idempotency_key),
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as exc:
        logger.error("MP create preference failed oferta=%s: %s", oferta_id, exc)
        raise


def buscar_pagamento_mp(payment_id):
    """Fetch a single payment from MP. Returns dict or None on failure."""
    try:
        resp = requests.get(
            f"{MP_API_BASE}/v1/payments/{payment_id}",
            headers=_mp_headers(),
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as exc:
        logger.error("MP get payment failed id=%s: %s", payment_id, exc)
        return None


def buscar_subscricao_mp(mp_subscription_id):
    """Fetch current subscription state from MP. Returns dict or None on failure."""
    try:
        resp = requests.get(
            f"{MP_API_BASE}/preapproval/{mp_subscription_id}",
            headers=_mp_headers(),
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as exc:
        logger.error("MP get subscription failed id=%s: %s", mp_subscription_id, exc)
        return None


def validar_assinatura_webhook(x_signature, x_request_id, data_id=None):
    """
    Validates Mercado Pago webhook signature.

    Header format: x-signature: ts=<timestamp>,v1=<hmac-sha256>
    Signed template: ts:<ts>\\nxRequestId:<id>\\n[data.id:<data_id>\\n]
    Returns True if valid or if MP_WEBHOOK_SECRET is not configured (dev mode).
    """
    secret = getattr(settings, "MP_WEBHOOK_SECRET", "")
    if not secret:
        return True  # dev: skip validation when secret not configured

    try:
        parts = {}
        for part in x_signature.split(","):
            k, v = part.split("=", 1)
            parts[k.strip()] = v.strip()
        ts = parts.get("ts", "")
        v1 = parts.get("v1", "")
    except (ValueError, AttributeError):
        return False

    manifest = f"ts:{ts}\nxRequestId:{x_request_id}\n"
    if data_id:
        manifest += f"data.id:{data_id}\n"

    expected = hmac.new(
        secret.encode("utf-8"),
        manifest.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, v1)


@transaction.atomic
def ativar_plano(negocio, plano, mp_subscription_id):
    """
    Activates or upgrades a plan after successful MP payment.
    Updates both Assinatura.status and Negocio.plano atomically.
    """
    assinatura, _ = Assinatura.objects.select_for_update().get_or_create(
        negocio=negocio,
        defaults={"plano": plano, "mp_subscription_id": mp_subscription_id},
    )
    assinatura.plano              = plano
    assinatura.status             = Assinatura.Status.ATIVA
    assinatura.mp_subscription_id = mp_subscription_id
    assinatura.cancelado_em       = None
    assinatura.save()

    negocio.plano = plano
    negocio.save(update_fields=["plano"])

    logger.info("Plano ativado: negocio=%s plano=%s", negocio.pk, plano)


@transaction.atomic
def cancelar_plano(negocio, cancel_status=Assinatura.Status.CANCELADA):
    """
    Marks subscription as cancelled/paused.
    Actual downgrade to gratuito happens after 7-day grace period via Celery task.
    """
    try:
        assinatura = negocio.assinatura
    except Assinatura.DoesNotExist:
        return

    assinatura.status      = cancel_status
    assinatura.cancelado_em = timezone.now()
    assinatura.save(update_fields=["status", "cancelado_em", "atualizado_em"])

    logger.info("Assinatura cancelada: negocio=%s status=%s", negocio.pk, cancel_status)
