from django.conf import settings
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from core.throttles import PasswordResetThrottle, CadastroThrottle
from .models import User
from .serializers import (
    UserSerializer,
    CadastroCompletoSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from .tokens import password_reset_token_generator


class CadastroCompletoView(generics.CreateAPIView):
    """
    Cadastro do comerciante: User + Negocio em uma transacao.
    Rate limit 3/h por IP via DRF throttle — retorna 429 JSON em vez do 403 HTML
    que django-ratelimit retornava (causava mensagem genérica no frontend).
    """
    serializer_class   = CadastroCompletoSerializer
    permission_classes = [AllowAny]
    throttle_classes   = [CadastroThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"ok": True}, status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def excluir_conta(request):
    """LGPD: exclui todos os dados do comerciante."""
    request.user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["password_atual"]):
            return Response(
                {"password_atual": "Senha atual incorreta."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["password_novo"])
        user.save(update_fields=["password"])
        return Response({"ok": True})


class PasswordResetRequestView(APIView):
    """
    Envia e-mail com link de reset. Responde 200 mesmo se o e-mail
    nao existe — evita enumeracao de usuarios.

    Rate limiting: PasswordResetThrottle (5/hour por IP) via DRF throttle_classes,
    que retorna 429 Too Many Requests em vez do 403 que django-ratelimit retornaria.

    Token invalidation: reset_token_version e incrementado antes de gerar o token,
    invalidando qualquer token anterior do mesmo usuario.
    """
    permission_classes  = [AllowAny]
    throttle_classes    = [PasswordResetThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email=email)

            # FAIL 1 fix: incrementar reset_token_version invalida todos os tokens
            # anteriores porque o hash do novo token tera um valor diferente.
            user.reset_token_version += 1
            user.save(update_fields=["reset_token_version"])

            uid   = urlsafe_base64_encode(force_bytes(user.pk))
            token = password_reset_token_generator.make_token(user)
            link  = f"{settings.FRONTEND_URL}/painel/nova-senha?uid={uid}&token={token}"

            send_mail(
                subject="Redefinição de senha — DescubraSul",
                message=(
                    f"Olá, {user.nome or user.email}!\n\n"
                    f"Você solicitou a redefinição de senha. Clique no link abaixo:\n\n"
                    f"{link}\n\n"
                    f"O link expira em 1 hora. Se não foi você, ignore este e-mail."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
            )
        except User.DoesNotExist:
            pass  # resposta identica — nao revela se o e-mail existe

        return Response({"ok": True})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            pk   = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=pk)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response(
                {"detail": "Link inválido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # FAIL 2 fix: usuarios inativos nao devem conseguir redefinir senha.
        # A verificacao ocorre antes de check_token para evitar qualquer operacao
        # com dados de usuarios que foram desativados administrativamente.
        if not user.is_active:
            return Response(
                {"detail": "Link inválido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # FAIL 1 fix: usa o generator customizado que inclui reset_token_version
        # no hash, garantindo que tokens anteriores (versao diferente) sejam rejeitados.
        if not password_reset_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response(
                {"detail": "Link expirado ou inválido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"ok": True})
