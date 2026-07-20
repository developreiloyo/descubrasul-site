from django.urls import path
from . import views

urlpatterns = [
    path("",                          views.listar_planos,    name="planos-listar"),
    path("minha-assinatura/",         views.minha_assinatura, name="planos-minha-assinatura"),
    path("assinar/<str:plano_slug>/", views.assinar_plano,    name="planos-assinar"),
    path("webhook/",                  views.webhook_mp,       name="planos-webhook"),
]
