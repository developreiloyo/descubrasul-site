# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "mcp[cli]>=1.4.0",
#   "google-auth>=2.35.0",
#   "requests>=2.32.0",
#   "psycopg2-binary>=2.9",
#   "python-dotenv>=1.0",
# ]
# ///
"""
Google Merchant Center MCP Server — ferramenta de desenvolvimento local.

Expõe a Merchant API v1 como ferramentas MCP para Claude Code e subagentes.
Permite testar serialização e autenticação contra a API real sem deploy ao VPS.

IMPORTANTE: Este servidor é exclusivamente de desenvolvimento.
Em produção, o sync roda via Celery task (merchant.tasks.sincronizar_feed_gmc).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SETUP (uma vez só):

1. Criar o arquivo de credenciais:
     mkdir -p ~/.config/descubrasul
     nano ~/.config/descubrasul/.env.gmc

   Conteúdo do .env.gmc:
     GMC_MERCHANT_ID=5830442942
     GMC_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
     GMC_DATABASE_URL=postgresql://descubrasul_user:PASSWORD@localhost:5432/descubrasul
     GMC_SITE_URL=https://descubrasul.com

2. Expor o PostgreSQL para acesso local (já está no docker-compose.override.yml).
   Verifique: docker-compose.override.yml deve ter:
     services:
       db:
         ports:
           - "5432:5432"

3. O registro no Claude Code está em ~/.claude/settings.json — já feito.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import json
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from contextlib import contextmanager
from decimal import Decimal
from pathlib import Path
from typing import Any

import psycopg2
import psycopg2.extras
import requests
from dotenv import load_dotenv
from google.auth.transport.requests import AuthorizedSession
from google.oauth2 import service_account
from mcp.server.fastmcp import FastMCP

# ─── Config ───────────────────────────────────────────────────────────────────

_ENV_FILE = os.environ.get(
    "GMC_ENV_FILE",
    str(Path.home() / ".config/descubrasul/.env.gmc"),
)
if Path(_ENV_FILE).exists():
    load_dotenv(_ENV_FILE)

MERCHANT_ID          = os.environ.get("GMC_MERCHANT_ID", "5830442942")
_SERVICE_ACCOUNT_JSON = os.environ.get("GMC_SERVICE_ACCOUNT_JSON", "")
DATABASE_URL         = os.environ.get("GMC_DATABASE_URL", "")
SITE_URL             = os.environ.get("GMC_SITE_URL", "https://descubrasul.com").rstrip("/")

# Merchant API v1 — Products sub-API
# Content API (content.googleapis.com) foi descontinuada em 18/08/2026.
# Todo código usa exclusivamente a Merchant API v1.
_API_BASE = "https://merchantapi.googleapis.com/products/v1"
_SCOPES   = ["https://www.googleapis.com/auth/content"]

PLANOS_GMC = {"pro", "producao"}

# ─── Mapeo de categorías ──────────────────────────────────────────────────────
# Taxonomia: https://www.google.com/basepages/producttype/taxonomy-with-ids.pt-BR.txt

_CATEGORIA_GMC: dict[str, int | None] = {
    "restaurantes": 1689,   # Food, Beverages & Tobacco > Food Items
    "alimentacao":  1689,
    "moda":         1604,   # Apparel & Accessories > Clothing
    "estetica":     2036,   # Health & Beauty > Personal Care > Skin Care
    "academias":    990,    # Sporting Goods > Exercise & Fitness
    "pet_shop":     1,      # Animals & Pet Supplies
    "clinicas":     491,    # Health & Beauty
    "educacao":     783,    # Media > Books
    "lojas_gerais": None,
    "servicos":     None,
}

# ─── Auth ─────────────────────────────────────────────────────────────────────

def _get_session() -> AuthorizedSession:
    """
    Returns an AuthorizedSession with a valid OAuth2 token for the service account.
    google-auth handles token refresh automatically.

    Accepts the service account JSON as:
    - Raw JSON string: {"type":"service_account",...}
    - Base64-encoded JSON (useful when embedding in env vars without escaping issues)
    """
    if not _SERVICE_ACCOUNT_JSON:
        raise RuntimeError(
            "GMC_SERVICE_ACCOUNT_JSON not set.\n"
            f"Add it to {_ENV_FILE}"
        )
    try:
        info = json.loads(_SERVICE_ACCOUNT_JSON)
    except json.JSONDecodeError:
        import base64
        info = json.loads(base64.b64decode(_SERVICE_ACCOUNT_JSON))

    creds = service_account.Credentials.from_service_account_info(info, scopes=_SCOPES)
    return AuthorizedSession(creds)


# ─── Acesso ao banco ──────────────────────────────────────────────────────────

@contextmanager
def _db():
    """
    Context manager for PostgreSQL access.
    Requires: GMC_DATABASE_URL set + port 5432 exposed in docker-compose.override.yml.
    """
    if not DATABASE_URL:
        raise RuntimeError(
            "GMC_DATABASE_URL not set.\n"
            f"Add it to {_ENV_FILE}\n"
            "Also ensure port 5432 is exposed in docker-compose.override.yml:\n"
            "  services:\n"
            "    db:\n"
            "      ports:\n"
            "        - '5432:5432'"
        )
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        with conn.cursor() as cur:
            yield cur
    finally:
        conn.close()


def _fetch_product(product_id: int) -> dict | None:
    """Fetches a single Produto + Negocio + Categoria from the local DB."""
    with _db() as cur:
        cur.execute("""
            SELECT
                p.id, p.nome, p.descricao, p.preco, p.disponivel,
                p.slug, p.tipo_produto, p.foto, p.atualizado_em,
                n.id   AS negocio_id,
                n.nome AS negocio_nome,
                n.slug AS negocio_slug,
                n.cidade, n.plano,
                c.slug AS categoria_slug
            FROM negocios_produto p
            JOIN negocios_negocio n ON p.negocio_id = n.id
            JOIN categorias_categoria c ON n.categoria_id = c.id
            WHERE p.id = %s
        """, (product_id,))
        row = cur.fetchone()
        if not row:
            return None
        produto = dict(row)

        cur.execute("""
            SELECT foto FROM negocios_fotoproduto
            WHERE produto_id = %s
            ORDER BY ordem, criado_em
            LIMIT 10
        """, (product_id,))
        produto["fotos"] = [r["foto"] for r in cur.fetchall()]
        return produto


def _fetch_eligible_products(modified_since: str | None = None) -> list[dict]:
    """
    Fetches all active products eligible for GMC sync (plano pro or producao).
    Optionally filtered by modification timestamp.
    """
    with _db() as cur:
        params: list[Any] = [list(PLANOS_GMC)]
        query = """
            SELECT
                p.id, p.nome, p.descricao, p.preco, p.disponivel,
                p.slug, p.tipo_produto, p.foto, p.atualizado_em,
                n.id   AS negocio_id,
                n.nome AS negocio_nome,
                n.slug AS negocio_slug,
                n.cidade, n.plano,
                c.slug AS categoria_slug
            FROM negocios_produto p
            JOIN negocios_negocio n ON p.negocio_id = n.id
            JOIN categorias_categoria c ON n.categoria_id = c.id
            WHERE p.disponivel = TRUE
              AND n.status = 'ativo'
              AND n.plano = ANY(%s)
        """
        if modified_since:
            query += " AND p.atualizado_em > %s"
            params.append(modified_since)

        cur.execute(query, params)
        products = [dict(r) for r in cur.fetchall()]

        if products:
            ids = [p["id"] for p in products]
            cur.execute("""
                SELECT produto_id, foto
                FROM negocios_fotoproduto
                WHERE produto_id = ANY(%s)
                ORDER BY ordem, criado_em
            """, (ids,))
            fotos_map: dict[int, list[str]] = {}
            for row in cur.fetchall():
                fotos_map.setdefault(row["produto_id"], []).append(row["foto"])
            for p in products:
                p["fotos"] = fotos_map.get(p["id"], [])[:10]

        return products


# ─── Serialização ─────────────────────────────────────────────────────────────
# Replica a lógica de backend/merchant/services.py de forma standalone.
# Qualquer mudança no mapeamento de campos deve ser aplicada nos dois lugares.

def _offer_id(produto: dict) -> str:
    """Stable offerId: descubrasul-{slug}-{pk}"""
    return f"descubrasul-{produto['slug']}-{produto['id']}"


def _product_name(produto: dict) -> str:
    """
    GMC resource name for Products v1.
    Format: {channel}~{content_language}~{feed_label}~{offer_id}
    """
    return f"online~pt~BR~{_offer_id(produto)}"


def _titulo(produto: dict) -> str:
    """
    Feed title (max 150 chars):  {tipo_produto} — {cidade}
    Falls back to nome if tipo_produto is blank.
    """
    base = (produto.get("tipo_produto") or "").strip() or produto["nome"]
    cidade = produto.get("cidade", "")
    return (f"{base} — {cidade}" if cidade else base)[:150]


def _descricao(produto: dict) -> str:
    texto = (produto.get("descricao") or produto["nome"])
    return f"{texto}\n\nConsulte disponibilidade e faça seu pedido pelo WhatsApp."[:5000]


def _abs_url(path: str | None) -> str | None:
    if not path:
        return None
    return path if path.startswith("http") else f"{SITE_URL}/{path.lstrip('/')}"


def _serializar(produto: dict) -> dict:
    """
    Converts a produto dict to Merchant API v1 product payload.

    Key differences from the deprecated Content API:
    - price: amountMicros (int64 as string) + currencyCode, not a "99.90 BRL" string
    - identifierExists (camelCase), not identifier_exists
    - channel / contentLanguage / feedLabel are top-level required fields
    - No customBatch — individual POST requests per product
    """
    payload: dict = {
        "channel":         "online",
        "contentLanguage": "pt",
        "feedLabel":       "BR",
        "offerId":         _offer_id(produto),
        "title":           _titulo(produto),
        "description":     _descricao(produto),
        "link":            f"{SITE_URL}/p/{produto['negocio_slug']}/{produto['slug']}",
        "availability":    "in_stock" if produto["disponivel"] else "out_of_stock",
        "condition":       "new",
        "brand":           produto["negocio_nome"],
        # Local/artisanal products do not have GTIN — declare explicitly to avoid rejection
        "identifierExists": False,
    }

    img = _abs_url(produto.get("foto"))
    if img:
        payload["imageLink"] = img

    extras = [u for u in (_abs_url(f) for f in produto.get("fotos", [])) if u]
    if extras:
        payload["additionalImageLinks"] = extras

    if produto.get("preco") is not None:
        payload["price"] = {
            "amountMicros": str(int(Decimal(str(produto["preco"])) * 1_000_000)),
            "currencyCode": "BRL",
        }

    gpc = _CATEGORIA_GMC.get(produto.get("categoria_slug"))
    if gpc is not None:
        payload["googleProductCategory"] = str(gpc)

    if produto.get("tipo_produto"):
        payload["productTypes"] = [produto["tipo_produto"]]

    return payload


# ─── Chamadas à API ───────────────────────────────────────────────────────────

def _api_insert(produto: dict, session: AuthorizedSession) -> tuple[bool, str, dict]:
    """POST accounts/{id}/products — inserts or updates if offerId already exists."""
    url = f"{_API_BASE}/accounts/{MERCHANT_ID}/products"
    try:
        resp = session.post(url, json=_serializar(produto), timeout=30)
        resp.raise_for_status()
        return True, "", resp.json()
    except requests.HTTPError as exc:
        msg = exc.response.text if exc.response is not None else str(exc)
        return False, msg[:2000], {}
    except Exception as exc:
        return False, str(exc)[:2000], {}


def _api_delete(produto: dict, session: AuthorizedSession) -> tuple[bool, str]:
    """DELETE accounts/{id}/products/{product_name}"""
    url = f"{_API_BASE}/accounts/{MERCHANT_ID}/products/{_product_name(produto)}"
    try:
        resp = session.delete(url, timeout=30)
        if resp.status_code == 404:
            return True, "not_found_in_gmc"
        resp.raise_for_status()
        return True, ""
    except requests.HTTPError as exc:
        msg = exc.response.text if exc.response is not None else str(exc)
        return False, msg[:2000]
    except Exception as exc:
        return False, str(exc)[:2000]


def _api_get(produto: dict, session: AuthorizedSession) -> tuple[bool, dict | None]:
    """GET accounts/{id}/products/{product_name} — returns None if 404."""
    url = f"{_API_BASE}/accounts/{MERCHANT_ID}/products/{_product_name(produto)}"
    try:
        resp = session.get(url, timeout=30)
        if resp.status_code == 404:
            return True, None
        resp.raise_for_status()
        return True, resp.json()
    except requests.HTTPError as exc:
        return False, {"error": exc.response.text if exc.response else str(exc)}
    except Exception as exc:
        return False, {"error": str(exc)}


# ─── MCP Server ──────────────────────────────────────────────────────────────

mcp = FastMCP(
    "GMC Dev Tools",
    instructions=(
        "Herramientas de desarrollo para Google Merchant Center (DescubraSul). "
        "Usa Merchant API v1 (merchantapi.googleapis.com/products/v1) — NOT Content API."
        "Solo para pruebas locales; en producción el sync corre vía Celery."
    ),
)


@mcp.tool()
def sync_product(product_id: int) -> str:
    """
    Serializes a Produto from the local database and sends it to Google Merchant Center.

    Uses: Merchant API v1 — POST accounts/{merchant_id}/products
    Eligible: only products with negocio.plano in {pro, producao}.

    Returns the GMC API response or a descriptive error.
    """
    produto = _fetch_product(product_id)
    if not produto:
        return f"ERROR: Produto {product_id} not found in local database."

    if produto["plano"] not in PLANOS_GMC:
        return (
            f"SKIPPED: Produto {product_id} belongs to negocio with plano "
            f"'{produto['plano']}' — GMC sync is restricted to Pro/Produção plans."
        )

    payload = _serializar(produto)
    session = _get_session()
    ok, msg, response = _api_insert(produto, session)

    if ok:
        return (
            f"✅ SUCCESS — Produto {product_id} synced to GMC\n"
            f"offerId  : {payload['offerId']}\n"
            f"title    : {payload['title']}\n"
            f"link     : {payload['link']}\n"
            f"price    : {payload.get('price', 'N/A')}\n"
            f"\nGMC response:\n{json.dumps(response, ensure_ascii=False, indent=2)}"
        )
    return f"❌ ERROR syncing produto {product_id}:\n{msg}"


@mcp.tool()
def delete_product(product_id: int) -> str:
    """
    Removes a product from the Google Merchant Center feed.

    Uses: Merchant API v1 — DELETE accounts/{merchant_id}/products/{product_name}
    where product_name = online~pt~BR~descubrasul-{slug}-{id}
    """
    produto = _fetch_product(product_id)
    if not produto:
        return f"ERROR: Produto {product_id} not found in local database."

    session = _get_session()
    ok, msg = _api_delete(produto, session)

    if not ok:
        return f"❌ ERROR deleting produto {product_id} from GMC:\n{msg}"
    if msg == "not_found_in_gmc":
        return (
            f"ℹ️  NOT FOUND: Product {product_id} (offerId: {_offer_id(produto)}) "
            f"was not in GMC — nothing deleted."
        )
    return f"✅ SUCCESS — Product {product_id} deleted from GMC feed."


@mcp.tool()
def check_sync_status(product_id: int) -> str:
    """
    Queries Google Merchant Center for the current state of a product.

    Uses: Merchant API v1 — GET accounts/{merchant_id}/products/{product_name}

    Returns the full product data from GMC including:
    - Current title, price, availability as stored in GMC
    - productStatus with destinationStatuses (approved / disapproved / pending)
    - Any issues Google flagged (missing fields, image quality, etc.)
    """
    produto = _fetch_product(product_id)
    if not produto:
        return f"ERROR: Produto {product_id} not found in local database."

    session = _get_session()
    ok, data = _api_get(produto, session)

    if not ok:
        return (
            f"❌ ERROR querying GMC for produto {product_id}:\n"
            f"{json.dumps(data, ensure_ascii=False, indent=2)}"
        )
    if data is None:
        return (
            f"ℹ️  NOT IN GMC: Produto {product_id} (offerId: {_offer_id(produto)}) "
            f"has not been synced yet — run sync_product({product_id}) first."
        )

    issues = data.get("productStatus", {}).get("itemLevelIssues", [])
    destinations = data.get("productStatus", {}).get("destinationStatuses", [])

    lines = [
        f"GMC STATUS — Produto {product_id}",
        f"offerId     : {_offer_id(produto)}",
        f"title       : {data.get('title', 'N/A')}",
        f"availability: {data.get('availability', 'N/A')}",
        f"price       : {data.get('price', 'N/A')}",
    ]
    if destinations:
        lines.append(f"destinations: {json.dumps(destinations, ensure_ascii=False)}")
    if issues:
        lines.append(f"\n⚠️  Issues ({len(issues)}):")
        for issue in issues:
            lines.append(
                f"  [{issue.get('severity', '?')}] {issue.get('description', '')} "
                f"(attribute: {issue.get('attribute', 'N/A')})"
            )
    lines.append(f"\nFull GMC data:\n{json.dumps(data, ensure_ascii=False, indent=2)}")
    return "\n".join(lines)


@mcp.tool()
def batch_sync(modified_since: str | None = None) -> str:
    """
    Syncs all active Pro/Produção products to Google Merchant Center.

    The Merchant API v1 has NO customBatch equivalent (removed from Content API).
    Strategy: individual POST calls executed in parallel via ThreadPoolExecutor
    (max_workers=10), with a 0.1s pause between batches of 10 to respect rate limits.

    Args:
        modified_since: ISO 8601 timestamp — only sync products modified after
                        this time (e.g. "2026-07-26T00:00:00"). If None, syncs all.

    Returns a summary with success/error counts and details of any failures.
    """
    products = _fetch_eligible_products(modified_since)
    if not products:
        filter_msg = f" modified after {modified_since}" if modified_since else ""
        return (
            f"No eligible products found{filter_msg}.\n"
            f"Eligible = disponivel=True, negocio.status=ativo, "
            f"negocio.plano in {{pro, producao}}."
        )

    session = _get_session()
    sucesso: list[int] = []
    erros: list[dict] = []

    # Process in batches of 10 — Merchant API v1 has no customBatch
    batch_size = 10
    for i in range(0, len(products), batch_size):
        batch = products[i : i + batch_size]

        with ThreadPoolExecutor(max_workers=batch_size) as executor:
            futures = {
                executor.submit(_api_insert, p, session): p
                for p in batch
            }
            for future in as_completed(futures):
                produto = futures[future]
                ok, msg, _ = future.result()
                if ok:
                    sucesso.append(produto["id"])
                else:
                    erros.append({"id": produto["id"], "error": msg[:300]})

        if i + batch_size < len(products):
            time.sleep(0.1)

    lines = [
        "BATCH SYNC COMPLETE",
        f"Total processed : {len(products)}",
        f"✅ Success      : {len(sucesso)}",
        f"❌ Errors       : {len(erros)}",
    ]
    if erros:
        lines.append("\nFailed products:")
        for e in erros:
            lines.append(f"  ID {e['id']}: {e['error']}")

    return "\n".join(lines)


if __name__ == "__main__":
    mcp.run()
