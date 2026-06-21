"""
Testes de isolamento entre usuários — endpoints de analytics.

Garante que user_a nunca enxerga métricas de user_b,
mesmo que ambos sejam Pro e tenham dados no banco.
"""
from datetime import date, timedelta
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from usuarios.models import User
from categorias.models import Categoria
from negocios.models import Negocio
from .models import MetricaDiaria


def criar_usuario_pro(email: str) -> tuple[User, Negocio]:
    user = User.objects.create_user(email=email, password="Senha@1234", nome="Teste")
    categoria = Categoria.objects.create(nome=f"Cat {email[:4]}", slug=f"cat-{email[:4]}")
    negocio = Negocio.objects.create(
        usuario=user,
        nome=f"Negócio {email}",
        categoria=categoria,
        cidade="Criciuma",
        whatsapp="48999990000",
        plano="pro",
        status=Negocio.Status.ATIVO,
    )
    return user, negocio


def seed_metricas(negocio: Negocio, dias: int = 3, base_views: int = 100) -> None:
    hoje = date.today()
    for i in range(dias):
        MetricaDiaria.objects.create(
            negocio=negocio,
            data=hoje - timedelta(days=i),
            total_views=base_views + i,
            total_whatsapp=10,
        )


class MetricasIsolamentoTests(TestCase):
    """GET /api/analytics/minhas-metricas/ — retorna somente métricas do negócio autenticado."""

    def setUp(self):
        self.client = APIClient()
        self.user_a, self.negocio_a = criar_usuario_pro("a@metricas.com")
        self.user_b, self.negocio_b = criar_usuario_pro("b@metricas.com")
        # user_a: views 100, 101, 102 | user_b: views 500, 501, 502 (valores distintos)
        seed_metricas(self.negocio_a, base_views=100)
        seed_metricas(self.negocio_b, base_views=500)
        self.url = "/api/analytics/minhas-metricas/"

    def _resultados(self, response) -> list:
        """Extrai lista de resultados de resposta paginada ou simples."""
        data = response.data
        return data.get("results", data) if isinstance(data, dict) else list(data)

    def test_retorna_somente_metricas_proprias(self):
        """
        Garante que user_a não vê as métricas de user_b.
        User_b tem total_views >= 500; nenhum resultado deve ter esse valor.
        """
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        resultados = self._resultados(response)
        views_retornados = {m["total_views"] for m in resultados}
        # user_a tem views 100, 101, 102 — nenhum valor de user_b (500, 501, 502) deve aparecer
        for views_b in [500, 501, 502]:
            self.assertNotIn(views_b, views_retornados)
        # Deve conter pelo menos um valor de user_a
        self.assertTrue(any(v in views_retornados for v in [100, 101, 102]))

    def test_count_metricas_bate_somente_com_proprias(self):
        """Número de registros retornados deve ser exatamente o de user_a, não user_a + user_b."""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        resultados = self._resultados(response)
        total_no_banco_de_a = MetricaDiaria.objects.filter(negocio=self.negocio_a).count()
        self.assertEqual(len(resultados), total_no_banco_de_a)

    def test_sem_autenticacao_retorna_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_plano_gratuito_retorna_403(self):
        user_gratis = User.objects.create_user(email="gratis@metricas.com", password="Senha@1234")
        categoria = Categoria.objects.create(nome="Cat G", slug="cat-g")
        Negocio.objects.create(
            usuario=user_gratis,
            nome="Negócio Grátis",
            categoria=categoria,
            cidade="Criciuma",
            whatsapp="48000000000",
            plano="gratuito",
            status=Negocio.Status.ATIVO,
        )
        self.client.force_authenticate(user=user_gratis)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class DashboardIsolamentoTests(TestCase):
    """GET /api/analytics/dashboard/ — retorna somente dados do negócio autenticado."""

    def setUp(self):
        self.client = APIClient()
        self.user_a, self.negocio_a = criar_usuario_pro("a@dash.com")
        self.user_b, self.negocio_b = criar_usuario_pro("b@dash.com")
        seed_metricas(self.negocio_a)
        seed_metricas(self.negocio_b)
        self.url = "/api/analytics/dashboard/"

    def test_dashboard_retorna_is_pro_true_para_plano_pro(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_pro"])

    def test_dashboard_nao_mistura_totais_de_outro_usuario(self):
        """
        Verifica que os totais de views retornados correspondem apenas
        às métricas do negócio de user_a, não ao somatório de todos.
        """
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        total_views_a = MetricaDiaria.objects.filter(negocio=self.negocio_a).values_list(
            "total_views", flat=True
        )
        soma_a = sum(total_views_a)

        total_views_b = MetricaDiaria.objects.filter(negocio=self.negocio_b).values_list(
            "total_views", flat=True
        )
        soma_ab = soma_a + sum(total_views_b)

        total_retornado = response.data["resumo"]["total_views"]
        self.assertEqual(total_retornado, soma_a)
        self.assertNotEqual(total_retornado, soma_ab)

    def test_sem_autenticacao_retorna_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
