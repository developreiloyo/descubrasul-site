from django.urls import path
from .views import RegisterView, CadastroCompletoView, MeView, excluir_conta

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("cadastro/", CadastroCompletoView.as_view(), name="cadastro-completo"),
    path("me/", MeView.as_view(), name="me"),
    path("me/delete/", excluir_conta, name="excluir_conta"),
]
