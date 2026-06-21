from django.urls import path
from .views import (
    CadastroCompletoView,
    MeView,
    excluir_conta,
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    # RegisterView removida: criava User sem Negocio, sem rate limit, tornando o
    # painel quebrável com 500. O fluxo correto é CadastroCompletoView (User+Negocio em transação).
    path("cadastro/", CadastroCompletoView.as_view(), name="cadastro-completo"),
    path("me/", MeView.as_view(), name="me"),
    path("me/delete/", excluir_conta, name="excluir_conta"),
    path("me/password/", ChangePasswordView.as_view(), name="change-password"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
]
