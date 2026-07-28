import logging

from celery import shared_task
from django.conf import settings

logger = logging.getLogger(__name__)

PLANOS_GMC = {"pro", "producao"}


@shared_task(name="merchant.tasks.sincronizar_feed_gmc", bind=True, max_retries=3)
def sincronizar_feed_gmc(self):
    """
    Daily sync of eligible Produto records with Google Merchant Center.

    Eligible = negocio.plano in {pro, producao} AND negocio.status = ativo.
    Plano gratuito is excluded — GMC sync is a Pro/Produção benefit.

    Steps:
    1. Upsert all active eligible products.
    2. Delete from GMC any previously synced products that are now inactive.
    """
    if not getattr(settings, "GMC_ENABLED", False):
        logger.info("GMC sync skipped — GMC_ENABLED is False")
        return {"skipped": True}

    from negocios.models import Produto
    from .models import SincronizacaoGMC
    from .services import (
        _get_authorized_session,
        gerar_offer_id,
        inserir_produto,
        deletar_produto,
    )

    try:
        session = _get_authorized_session()
    except Exception as exc:
        logger.error("GMC auth failed: %s", exc)
        raise self.retry(exc=exc, countdown=300)

    # ── 1. Upsert active products ─────────────────────────────────────────────
    produtos_ativos = (
        Produto.objects
        .filter(
            disponivel=True,
            negocio__status="ativo",
            negocio__plano__in=PLANOS_GMC,
        )
        .select_related("negocio", "negocio__categoria")
        .prefetch_related("fotos")
    )

    sucesso = erro = 0
    for produto in produtos_ativos:
        ok, msg = inserir_produto(produto, session)
        estado = (
            SincronizacaoGMC.Estado.SUCESSO
            if ok
            else SincronizacaoGMC.Estado.ERRO
        )
        SincronizacaoGMC.objects.update_or_create(
            produto=produto,
            defaults={
                "estado": estado,
                "gmc_offer_id": gerar_offer_id(produto),
                "mensagem_google": msg,
            },
        )
        if ok:
            sucesso += 1
        else:
            erro += 1

    # ── 2. Delete inactive products previously synced successfully ────────────
    deletados = 0
    produtos_a_deletar = (
        Produto.objects
        .filter(
            disponivel=False,
            sincronizacao_gmc__estado=SincronizacaoGMC.Estado.SUCESSO,
        )
        .select_related("negocio")
    )
    for produto in produtos_a_deletar:
        ok, msg = deletar_produto(produto, session)
        if ok:
            SincronizacaoGMC.objects.filter(produto=produto).update(
                estado=SincronizacaoGMC.Estado.DELETADO,
                mensagem_google=msg,
            )
            deletados += 1

    logger.info(
        "GMC sync complete — sucesso=%d erro=%d deletados=%d",
        sucesso, erro, deletados,
    )
    return {"sucesso": sucesso, "erro": erro, "deletados": deletados}
