from django.urls import path
from .views import RegistrarCliqueView, MinhasMetricasView, dashboard_metricas

urlpatterns = [
    path("clique/",          RegistrarCliqueView.as_view(), name="registrar-clique"),
    path("minhas-metricas/", MinhasMetricasView.as_view(),  name="minhas-metricas"),
    path("dashboard/",       dashboard_metricas,             name="dashboard-metricas"),
]