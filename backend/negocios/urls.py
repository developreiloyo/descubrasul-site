from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NegocioListView, NegocioDetailView, ProdutoListView,
    MeuNegocioView, MeusProdutosViewSet,
)

router = DefaultRouter()
router.register(r"painel/produtos", MeusProdutosViewSet, basename="meus-produtos")

urlpatterns = [
    path("", NegocioListView.as_view(), name="negocio-list"),
    path("<slug:slug>/", NegocioDetailView.as_view(), name="negocio-detail"),
    path("<slug:negocio_slug>/produtos/", ProdutoListView.as_view(), name="produto-list"),
    path("painel/meu-negocio/", MeuNegocioView.as_view(), name="meu-negocio"),
    path("", include(router.urls)),
]
