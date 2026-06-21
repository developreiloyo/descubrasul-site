"""
Testes de isolamento entre usuários — endpoints do painel de negócios.

Regra crítica: um comerciante NUNCA pode ler ou modificar dados de outro.
Cada teste cria dois usuários (user_a, user_b) com negócios distintos e
verifica que user_a não acessa recursos de user_b.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from usuarios.models import User
from categorias.models import Categoria
from .models import Negocio, Produto


def criar_usuario_com_negocio(email: str, plano: str = "gratuito") -> tuple[User, Negocio]:
    """Helper: cria User + Categoria + Negocio em uma transação de teste."""
    user = User.objects.create_user(email=email, password="Senha@1234", nome="Teste")
    categoria = Categoria.objects.create(nome=f"Cat {email}", slug=f"cat-{email[:4]}")
    negocio = Negocio.objects.create(
        usuario=user,
        nome=f"Negócio de {email}",
        categoria=categoria,
        cidade="Criciuma",
        whatsapp="48999990000",
        plano=plano,
        status=Negocio.Status.ATIVO,
    )
    return user, negocio


def criar_produto(negocio: Negocio, nome: str = "Produto X") -> Produto:
    return Produto.objects.create(
        negocio=negocio,
        nome=nome,
        disponivel=True,
    )


class MeuNegocioIsolamentoTests(TestCase):
    """GET/PATCH /api/negocios/painel/meu-negocio/ — retorna sempre o negócio do usuário autenticado."""

    def setUp(self):
        self.client = APIClient()
        self.user_a, self.negocio_a = criar_usuario_com_negocio("a@test.com")
        self.user_b, self.negocio_b = criar_usuario_com_negocio("b@test.com")
        self.url = "/api/negocios/painel/meu-negocio/"

    def test_get_retorna_negocio_proprio(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # NegocioPainelSerializer expõe slug como identificador único, não id
        self.assertEqual(response.data["slug"], self.negocio_a.slug)

    def test_get_nao_retorna_negocio_alheio(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(self.url)
        self.assertNotEqual(response.data["slug"], self.negocio_b.slug)

    def test_patch_atualiza_somente_negocio_proprio(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.patch(self.url, {"nome": "Novo Nome A"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.negocio_b.refresh_from_db()
        self.assertNotEqual(self.negocio_b.nome, "Novo Nome A")

    def test_get_sem_autenticacao_retorna_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProdutoIsolamentoTests(TestCase):
    """
    /api/negocios/painel/produtos/ — user_a não pode listar, ler,
    editar, deletar nem acionar actions em produtos de user_b.
    """

    def setUp(self):
        self.client = APIClient()
        self.user_a, self.negocio_a = criar_usuario_com_negocio("a@prod.com")
        self.user_b, self.negocio_b = criar_usuario_com_negocio("b@prod.com")
        self.produto_a = criar_produto(self.negocio_a, "Produto A")
        self.produto_b = criar_produto(self.negocio_b, "Produto B")
        self.url_list   = "/api/negocios/painel/produtos/"
        self.url_b      = f"/api/negocios/painel/produtos/{self.produto_b.pk}/"
        self.url_b_conf = f"/api/negocios/painel/produtos/{self.produto_b.pk}/confirmar_disponibilidade/"
        self.url_b_dest = f"/api/negocios/painel/produtos/{self.produto_b.pk}/destacar/"

    # ── Listagem ─────────────────────────────────────────────────────────
    def test_lista_nao_inclui_produtos_alheios(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(self.url_list)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [p["id"] for p in response.data.get("results", response.data)]
        self.assertIn(self.produto_a.pk, ids)
        self.assertNotIn(self.produto_b.pk, ids)

    # ── Leitura de objeto ─────────────────────────────────────────────────
    def test_get_produto_alheio_retorna_404(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(self.url_b)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Edição ────────────────────────────────────────────────────────────
    def test_patch_produto_alheio_retorna_404(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.patch(self.url_b, {"nome": "Hack"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.produto_b.refresh_from_db()
        self.assertNotEqual(self.produto_b.nome, "Hack")

    def test_put_produto_alheio_retorna_404(self):
        self.client.force_authenticate(user=self.user_a)
        payload = {"nome": "Hack", "disponivel": True}
        response = self.client.put(self.url_b, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Exclusão ─────────────────────────────────────────────────────────
    def test_delete_produto_alheio_retorna_404(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.delete(self.url_b)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Produto.objects.filter(pk=self.produto_b.pk).exists())

    # ── Actions ──────────────────────────────────────────────────────────
    def test_confirmar_disponibilidade_produto_alheio_retorna_404(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.post(self.url_b_conf)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_destacar_produto_alheio_retorna_404(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.post(self.url_b_dest)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Sem autenticação ─────────────────────────────────────────────────
    def test_lista_sem_autenticacao_retorna_401(self):
        response = self.client.get(self.url_list)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_sem_autenticacao_retorna_401(self):
        response = self.client.delete(self.url_b)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Criação não vaza entre negócios ──────────────────────────────────
    def test_create_produto_atribuido_ao_negocio_proprio(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.post(self.url_list, {"nome": "Novo Produto"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        novo = Produto.objects.get(pk=response.data["id"])
        self.assertEqual(novo.negocio, self.negocio_a)
        self.assertNotEqual(novo.negocio, self.negocio_b)


class StatusPlanoIsolamentoTests(TestCase):
    """/api/negocios/painel/produtos/status_plano/ — retorna dados do negócio próprio."""

    def setUp(self):
        self.client = APIClient()
        self.user_a, self.negocio_a = criar_usuario_com_negocio("a@plano.com", plano="pro")
        self.user_b, self.negocio_b = criar_usuario_com_negocio("b@plano.com", plano="gratuito")
        self.url = "/api/negocios/painel/produtos/status_plano/"

    def test_retorna_plano_do_usuario_autenticado(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["plano"], "pro")

    def test_nao_retorna_plano_de_outro_usuario(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(self.url)
        self.assertNotEqual(response.data["plano"], "gratuito")
