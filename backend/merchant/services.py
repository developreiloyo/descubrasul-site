"""
Google Merchant Center sync — Merchant API v1 (merchantapi.googleapis.com)

⚠️  A Content API for Shopping (content.googleapis.com) foi descontinuada e
    será desativada em 18/08/2026. Todo código aqui usa EXCLUSIVAMENTE a
    Merchant API v1 (Products sub-API).

Documentação oficial:
  https://developers.google.com/merchant/api/reference/rest/products/v1
"""
import json
import logging
import re
from decimal import Decimal

import requests
from django.conf import settings

from .category_map import CATEGORIA_GMC

logger = logging.getLogger(__name__)

# Merchant API v1 — Products sub-API
_API_BASE = "https://merchantapi.googleapis.com/products/v1"

# Scope mantido da Content API — reutilizado pela Merchant API v1
_SCOPES = ["https://www.googleapis.com/auth/content"]

# Planos que têm direito à sync com GMC
PLANOS_GMC = {"pro", "producao"}

# Padrões de código interno que não devem aparecer no feed do Google
# Ex: "ref-123", "v25", "#456", sequências numéricas longas como SKUs internos
# Nota: # não é word-char, então \b não âncora corretamente antes de # — usamos (?<!\w)
_CODIGO_INTERNO = re.compile(
    r"(?<!\w)ref[-–]\S+|(?<!\w)v\d+[a-z]?\b|(?<!\w)#\d+|\b\d{6,}\b",
    flags=re.IGNORECASE,
)


# ─── Autenticação ─────────────────────────────────────────────────────────────

def _get_authorized_session() -> requests.Session:
    """
    Returns a requests.Session with a valid Bearer token for the service account.
    google-auth handles token refresh automatically via AuthorizedSession.
    """
    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession

    service_account_info = json.loads(settings.GMC_SERVICE_ACCOUNT_JSON)
    credentials = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=_SCOPES,
    )
    return AuthorizedSession(credentials)


# ─── Serialização ─────────────────────────────────────────────────────────────

def gerar_offer_id(produto) -> str:
    """
    Stable, unique offerId for a product.
    Uses slug + pk to guarantee uniqueness even after slug collisions.
    Format: descubrasul-{slug}-{pk}
    """
    return f"descubrasul-{produto.slug}-{produto.pk}"


def _filtrar_codigos(texto: str) -> str:
    """Strip internal codes (ref-XXX, v25, #123, long SKUs) from a product name."""
    limpo = _CODIGO_INTERNO.sub("", texto)
    return " ".join(limpo.split())


def gerar_titulo_feed(produto) -> str:
    """
    Generates the GMC feed title following spec 11.2 (max 150 chars).

    Formula: {tipo_produto} {nome_como_qualificador} — {cidade}

    - tipo_produto is always the primary base when present; Produto.nome acts
      as the descriptive qualifier (secondary role) appended after tipo_produto.
    - If nome starts with tipo_produto (case-insensitive), the duplicated prefix
      is stripped before appending to avoid redundancy (e.g. "Pizza" + "Pizza
      Margherita" → "Pizza Margherita", not "Pizza Pizza Margherita").
    - If tipo_produto is blank, Produto.nome is used directly as the base.
    - Internal codes (ref-XXX, v25, #123) are stripped from nome before use.
    - The public-facing Produto.nome is never modified — the feed title is
      generated separately, invisible to the merchant.
    """
    tipo = (produto.tipo_produto or "").strip()
    nome = _filtrar_codigos(produto.nome)

    if tipo:
        nome_lower = nome.lower()
        tipo_lower = tipo.lower()
        if nome_lower.startswith(tipo_lower):
            # Full prefix match: "Pizza Margherita" + tipo "Pizza" → "Pizza Margherita"
            residual = nome[len(tipo):].strip().lstrip("–— -").strip()
            partes = [tipo, residual] if residual else [tipo]
        else:
            # Partial first-word match: tipo "Corte de Cabelo" + nome "Corte Masculino"
            # → strip shared leading word → "Corte de Cabelo Masculino"
            tipo_words = tipo_lower.split()
            nome_words = nome_lower.split()
            if tipo_words and nome_words and nome_words[0] == tipo_words[0]:
                residual = " ".join(nome.split()[1:]).strip()
                partes = [tipo, residual] if residual else [tipo]
            else:
                partes = [tipo, nome] if nome else [tipo]
        base = " ".join(partes)
    else:
        base = nome or produto.nome

    cidade = (produto.negocio.cidade or "").strip()
    titulo = f"{base} — {cidade}" if cidade else base
    return titulo[:150]


def _image_url_absoluta(campo_imagem) -> str | None:
    """Returns the absolute URL for an ImageField, or None if empty."""
    if not campo_imagem:
        return None
    url = campo_imagem.url
    if url.startswith("http"):
        return url
    # Local dev: prefix with GMC_SITE_URL (in prod, storage is S3 and already absolute)
    return f"{settings.GMC_SITE_URL.rstrip('/')}{url}"


def serializar_produto(produto) -> dict:
    """
    Converts a Produto + Negocio to the Merchant API v1 product payload.

    Key differences from Content API:
    - price.amountMicros (int64 as string) + price.currencyCode instead of
      a combined "99.90 BRL" string
    - channel / contentLanguage / feedLabel are top-level required fields
    - identifierExists replaces the old identifier_exists attribute
    """
    offer_id = gerar_offer_id(produto)

    payload: dict = {
        # Required identification
        "channel": "online",
        "contentLanguage": "pt",
        "feedLabel": "BR",
        "offerId": offer_id,
        # Required content
        "title": gerar_titulo_feed(produto),
        "description": _gerar_descricao(produto),
        "link": f"{settings.GMC_SITE_URL}/p/{produto.negocio.slug}/{produto.slug}",
        # Required attributes
        "availability": "in_stock" if produto.disponivel else "out_of_stock",
        "condition": "new",
        "brand": produto.negocio.nome,
        # Most local/handmade products don't have GTIN — declare explicitly
        "identifierExists": False,
    }

    # Main image
    img = _image_url_absoluta(produto.foto)
    if img:
        payload["imageLink"] = img

    # Additional images (up to 10, from FotoProduto)
    fotos_extras = [
        _image_url_absoluta(f.foto)
        for f in produto.fotos.all()[:10]
        if _image_url_absoluta(f.foto)
    ]
    if fotos_extras:
        payload["additionalImageLinks"] = fotos_extras

    # Price — only if set; amountMicros is int64 represented as string in JSON
    if produto.preco is not None:
        payload["price"] = {
            "amountMicros": str(int(Decimal(str(produto.preco)) * 1_000_000)),
            "currencyCode": "BRL",
        }

    # Google Product Category (numeric ID from taxonomy)
    categoria_slug = getattr(produto.negocio.categoria, "slug", None)
    gpc = CATEGORIA_GMC.get(categoria_slug)
    if gpc is not None:
        payload["googleProductCategory"] = str(gpc)

    # Product type hierarchy (tipo_produto as leaf node)
    if produto.tipo_produto:
        payload["productTypes"] = [produto.tipo_produto]

    return payload


def _gerar_descricao(produto) -> str:
    """
    Builds the GMC product description (max 5000 chars).
    Appends a fixed WhatsApp contact line — required because DescubraSul
    has no checkout; buyers must contact the negocio directly.
    """
    contato = "Consulte disponibilidade e faça seu pedido pelo WhatsApp."
    base = produto.descricao or produto.nome
    desc = f"{base}\n\n{contato}" if base else contato
    return desc[:5000]


# ─── API Calls ────────────────────────────────────────────────────────────────

def inserir_produto(produto, session: requests.Session) -> tuple[bool, str]:
    """
    Upserts a product in GMC via Merchant API v1.
    Returns (success, message).

    POST /accounts/{merchant_id}/products  →  inserts or updates if offerId exists.
    """
    url = f"{_API_BASE}/accounts/{settings.GMC_MERCHANT_ID}/products"
    try:
        payload = serializar_produto(produto)
        resp = session.post(url, json=payload, timeout=30)
        resp.raise_for_status()
        return True, ""
    except requests.HTTPError as exc:
        msg = exc.response.text if exc.response is not None else str(exc)
        logger.error("GMC insert failed | produto=%s | %s", produto.pk, msg[:500])
        return False, msg[:2000]
    except Exception as exc:
        logger.error("GMC insert error | produto=%s | %s", produto.pk, exc)
        return False, str(exc)[:2000]


def deletar_produto(produto, session: requests.Session) -> tuple[bool, str]:
    """
    Deletes a product from GMC.
    Returns (success, message).

    DELETE /accounts/{merchant_id}/products/{product_name}
    Product name in Merchant API v1: online~pt~BR~{offer_id}
    """
    offer_id = gerar_offer_id(produto)
    product_name = f"online~pt~BR~{offer_id}"
    url = f"{_API_BASE}/accounts/{settings.GMC_MERCHANT_ID}/products/{product_name}"
    try:
        resp = session.delete(url, timeout=30)
        if resp.status_code == 404:
            return True, "not_found_in_gmc"
        resp.raise_for_status()
        return True, ""
    except requests.HTTPError as exc:
        msg = exc.response.text if exc.response is not None else str(exc)
        logger.error("GMC delete failed | produto=%s | %s", produto.pk, msg[:500])
        return False, msg[:2000]
    except Exception as exc:
        logger.error("GMC delete error | produto=%s | %s", produto.pk, exc)
        return False, str(exc)[:2000]
