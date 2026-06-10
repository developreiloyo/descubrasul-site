from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import User
from .serializers import (
    RegisterSerializer, UserSerializer, CadastroCompletoSerializer,
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
