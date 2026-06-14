from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CadastroCompletoSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


@method_decorator(ratelimit(key="ip", rate="3/h", method="POST", block=True), name="post")
class CadastroCompletoView(generics.CreateAPIView):
    """
    Cadastro do comerciante: User + Negocio em uma transacao.
    Rate limit 3/h por IP — protecao contra cadastros automatizados.
    """
    serializer_class   = CadastroCompletoSerializer
    permission_classes = [AllowAny]

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


@method_decorator(ratelimit(key="ip", rate="5/h", method="POST", block=True), name="post")
class PasswordResetRequestView(APIView):
    """
    Envia e-mail com link de reset. Responde 200 mesmo se o e-mail
    nao existe — evita enumeracao de usuarios.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email=email)
            uid   = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            link  = f"{settings.FRONTEND_URL}/painel/nova-senha?uid={uid}&token={token}"

            send_mail(
                subject="Redefinição de senha — DescubraSul",
                message=(
                    f"Olá, {user.nome or user.email}!\n\n"
                    f"Você solicitou a redefinição de senha. Clique no link abaixo:\n\n"
                    f"{link}\n\n"
                    f"O link expira em 24 horas. Se não foi você, ignore este e-mail."
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

        if not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response(
                {"detail": "Link expirado ou inválido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"ok": True})
