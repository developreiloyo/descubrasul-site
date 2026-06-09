from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from .models import LIMITES_PRODUTOS


class IsDonoDoNegocio(BasePermission):
    """Garante que o comerciante só acessa seus próprios dados."""

    def has_object_permission(self, request, view, obj):
        negocio = getattr(obj, "negocio", obj)
        return negocio.usuario == request.user


class IsPlanoPro(BasePermission):
    """Restringe acesso a features do Plano Pro (IA, Maps, métricas, vídeos)."""

    message = "Este recurso está disponível apenas no Plano Pro."

    def has_permission(self, request, view):
        negocio = getattr(request.user, "negocio", None)
        return negocio is not None and negocio.is_pro


class IsPlanoBasicoOuSuperior(BasePermission):
    """Restringe acesso a planos pagos (Básico, Pro, Produção, Fundador)."""

    message = "Este recurso está disponível apenas em planos pagos."

    def has_permission(self, request, view):
        negocio = getattr(request.user, "negocio", None)
        return negocio is not None and negocio.is_pago


class PodicionarProduto(BasePermission):
    """
    Valida o limite de produtos por plano antes de criar.

    Gratuito : 5 produtos
    Básico   : 20 produtos
    Pro+     : ilimitado
    """

    def has_permission(self, request, view):
        # Só bloquear na criação (POST)
        if request.method != "POST":
            return True

        negocio = getattr(request.user, "negocio", None)
        if negocio is None:
            return False

        if not negocio.pode_adicionar_produto:
            limite = negocio.limite_produtos
            plano  = negocio.get_plano_display()
            raise PermissionDenied(
                f"Limite de {limite} produtos atingido no {plano}. "
                f"Faça upgrade para adicionar mais produtos."
            )
        return True
