from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NegocioListView, NegocioDetailView, ProdutoListView,
    MeuNegocioView, MeusProdutosViewSet, produtos_destaque,
    buscar_google, reviews_google, FotoNegocioViewSet,
)

router = DefaultRouter()
router.register(r"painel/produtos", MeusProdutosViewSet, basename="meus-produtos")
router.register(r"painel/galeria", FotoNegocioViewSet, basename="galeria")

urlpatterns = [
    # Exatas primeiro
    path("", NegocioListView.as_view(), name="negocio-list"),
    path("produtos/destaque/", produtos_destaque, name="produtos-destaque"),
    path("painel/meu-negocio/", MeuNegocioView.as_view(), name="meu-negocio"),
    path("painel/buscar-google/", buscar_google, name="buscar-google"),

    # Router do painel ANTES dos slugs genericos
    path("", include(router.urls)),

    # Slugs genericos por ultimo — funcionam como catch-all
    path("<slug:slug>/", NegocioDetailView.as_view(), name="negocio-detail"),
    path("<slug:slug>/reviews-google/", reviews_google, name="reviews-google"),
    path("<slug:negocio_slug>/produtos/", ProdutoListView.as_view(), name="produto-list"),
]
