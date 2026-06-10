from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NegocioListView, NegocioDetailView, ProdutoListView,
    MeuNegocioView, MeusProdutosViewSet,
)

router = DefaultRouter()
router.register(r"painel/produtos", MeusProdutosViewSet, basename="meus-produtos")

urlpatterns = [
    # Exatas primeiro
    path("", NegocioListView.as_view(), name="negocio-list"),
    path("painel/meu-negocio/", MeuNegocioView.as_view(), name="meu-negocio"),

    # Router do painel ANTES dos slugs genericos
    path("", include(router.urls)),

    # Slugs genericos por ultimo — funcionam como catch-all
    path("<slug:slug>/", NegocioDetailView.as_view(), name="negocio-detail"),
    path("<slug:negocio_slug>/produtos/", ProdutoListView.as_view(), name="produto-list"),
]
