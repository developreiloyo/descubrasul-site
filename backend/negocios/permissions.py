from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from .models import LIMITES_PRODUTOS, PLANO_CONFIG


class IsDonoDoNegocio(BasePermission):
    """Garante que o comerciante só acessa seus próprios dados."""

    def has_object_permission(self, request, view, obj):
        negocio = getattr(obj, "negocio", obj)
        return negocio.usuario == request.user


class IsPlanoPro(BasePermission):
    """Restringe acesso a features dos planos Conexão Sul e Destaque Sul."""

    message = "Este recurso está disponível apenas nos planos Conexão Sul e Destaque Sul."

    def has_permission(self, request, view):
        negocio = getattr(request.user, "negocio", None)
        return negocio is not None and negocio.is_pro


class IsPlanoBasicoOuSuperior(BasePermission):
    """Restringe acesso a planos pagos (Conexão Sul ou Destaque Sul)."""

    message = "Este recurso está disponível apenas em planos pagos."

    def has_permission(self, request, view):
        negocio = getattr(request.user, "negocio", None)
        return negocio is not None and negocio.is_pago


class PodicionarProduto(BasePermission):
    """
    Valida o limite de produtos por plano antes de criar.

    Limites derivados de PLANO_CONFIG (fonte única de verdade):
      gratuito  : 5 produtos
      pro       : 5 produtos
      producao  : 10 produtos
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
