from django.urls import path
from .views import RegistrarCliqueView, MinhasMetricasView

urlpatterns = [
    path("clique/", RegistrarCliqueView.as_view(), name="registrar-clique"),
    path("minhas-metricas/", MinhasMetricasView.as_view(), name="minhas-metricas"),
]
