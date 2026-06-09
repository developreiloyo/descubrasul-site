from django.urls import path
from .views import RegisterView, MeView, excluir_conta

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("me/delete/", excluir_conta, name="excluir_conta"),
]
