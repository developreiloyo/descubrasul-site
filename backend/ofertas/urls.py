from django.urls import path
from . import views

urlpatterns = [
    path("ativas/",   views.listar_ativas,    name="ofertas-ativas"),
    path("minhas/",   views.minhas_ofertas,   name="ofertas-minhas"),
    path("webhook/",  views.webhook_mp_oferta, name="ofertas-webhook"),
    path("",          views.criar_oferta,      name="ofertas-criar"),
]
