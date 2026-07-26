"""
Testes de isolamento entre usuários — endpoints do painel de negócios.

Regra crítica: um comerciante NUNCA pode ler ou modificar dados de outro.
Cada teste cria dois usuários (user_a, user_b) com negócios distintos e
verifica que user_a não acessa recursos de user_b.
"""
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status

from usuarios.models import User
from categorias.models import Categoria
from .models import Negocio, Produto, Localizacao


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

    def test_adicionar_foto_produto_alheio_retorna_404(self):
        self.client.force_authenticate(user=self.user_a)
        url = f"/api/negocios/painel/produtos/{self.produto_b.pk}/fotos/"
        response = self.client.post(url, {}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_remover_foto_produto_alheio_retorna_404(self):
        from .models import FotoProduto
        foto = FotoProduto.objects.create(
            produto=self.produto_b, foto="test/foto.jpg", alt_texto="", ordem=0
        )
        self.client.force_authenticate(user=self.user_a)
        url = f"/api/negocios/painel/produtos/{self.produto_b.pk}/fotos/{foto.pk}/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(FotoProduto.objects.filter(pk=foto.pk).exists())

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


class ValidacoesPainelTests(TestCase):
    """Testes de validação de campos no PATCH /api/negocios/painel/meu-negocio/."""

    def setUp(self):
        self.client = APIClient()
        self.user, self.negocio = criar_usuario_com_negocio("v@test.com")
        self.client.force_authenticate(user=self.user)
        self.url = "/api/negocios/painel/meu-negocio/"

    def test_patch_logradouro_numero_gera_direccao_fmt(self):
        payload = {
            "localizacao": {
                "logradouro": "Rua das Flores",
                "numero": "123",
                "bairro": "Centro",
                "cidade": "Criciúma",
                "estado": "SC",
                "cep": "88800-000",
            }
        }
        response = self.client.patch(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        loc = Localizacao.objects.get(negocio=self.negocio)
        self.assertEqual(loc.logradouro, "Rua das Flores")
        self.assertEqual(loc.numero, "123")
        self.assertIn("Rua das Flores", loc.direccao_fmt)
        self.assertIn("123", loc.direccao_fmt)

    def test_patch_cidade_invalida_retorna_400(self):
        response = self.client.patch(self.url, {"cidade": "São Paulo"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("cidade", response.data)

    def test_patch_whatsapp_menos_de_10_digitos_retorna_400(self):
        response = self.client.patch(self.url, {"whatsapp": "4899"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("whatsapp", response.data)

    def test_patch_whatsapp_valido_salva_apenas_digitos(self):
        response = self.client.patch(self.url, {"whatsapp": "+55 (48) 99999-0000"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.negocio.refresh_from_db()
        self.assertEqual(self.negocio.whatsapp, "48999990000")


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


@override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}})
class ProdutosDestaqueTests(TestCase):
    """GET /api/negocios/produtos/destaque/ — priorização e filtragem dos produtos em destaque."""

    URL = "/api/negocios/produtos/destaque/"

    def setUp(self):
        self.client = APIClient()
        _, self.neg_producao = criar_usuario_com_negocio("p@dest.com",   plano="producao")
        _, self.neg_pro      = criar_usuario_com_negocio("pro@dest.com", plano="pro")
        _, self.neg_gratuito = criar_usuario_com_negocio("g@dest.com",   plano="gratuito")

        self.prod_producao = criar_produto(self.neg_producao, "Produto Producao")
        self.prod_pro      = criar_produto(self.neg_pro,      "Produto Pro")
        self.prod_gratuito = criar_produto(self.neg_gratuito, "Produto Gratuito")

    # ── Acesso público ────────────────────────────────────────────────────
    def test_publico_sem_autenticacao(self):
        response = self.client.get(self.URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ── Filtros de elegibilidade ──────────────────────────────────────────
    def test_gratuito_excluido(self):
        response = self.client.get(self.URL)
        slugs_negocios = [p["negocio"]["slug"] for p in response.data]
        self.assertNotIn(self.neg_gratuito.slug, slugs_negocios)

    def test_planos_pagos_incluidos(self):
        response = self.client.get(self.URL)
        slugs_negocios = [p["negocio"]["slug"] for p in response.data]
        self.assertIn(self.neg_producao.slug, slugs_negocios)
        self.assertIn(self.neg_pro.slug,      slugs_negocios)

    def test_negocio_inativo_excluido(self):
        _, neg_inativo = criar_usuario_com_negocio("i@dest.com", plano="pro")
        neg_inativo.status = Negocio.Status.INATIVO
        neg_inativo.save()
        criar_produto(neg_inativo, "Produto Inativo")

        response = self.client.get(self.URL)
        slugs = [p["negocio"]["slug"] for p in response.data]
        self.assertNotIn(neg_inativo.slug, slugs)

    def test_negocio_sem_produto_disponivel_excluido(self):
        _, neg_vazio = criar_usuario_com_negocio("v@dest.com", plano="pro")
        Produto.objects.create(negocio=neg_vazio, nome="Indisponível", disponivel=False)

        response = self.client.get(self.URL)
        slugs = [p["negocio"]["slug"] for p in response.data]
        self.assertNotIn(neg_vazio.slug, slugs)

    # ── Um produto por negócio ────────────────────────────────────────────
    def test_um_produto_por_negocio(self):
        criar_produto(self.neg_producao, "Produto Producao 2")
        criar_produto(self.neg_producao, "Produto Producao 3")

        response = self.client.get(self.URL)
        slugs_negocios = [p["negocio"]["slug"] for p in response.data]
        self.assertEqual(
            len(slugs_negocios), len(set(slugs_negocios)),
            "Negócio duplicado — deveria retornar apenas um produto por negócio",
        )

    # ── Ordenação por plano ───────────────────────────────────────────────
    def test_producao_antes_de_pro(self):
        response = self.client.get(self.URL)
        slugs = [p["negocio"]["slug"] for p in response.data]
        self.assertLess(
            slugs.index(self.neg_producao.slug),
            slugs.index(self.neg_pro.slug),
        )

    # ── Priorização de foto dentro do negócio ────────────────────────────
    def test_produto_com_foto_priorizado_sobre_sem_foto(self):
        """O produto com foto deve ser retornado, mesmo que venha depois na ordenação por `ordem`."""
        _, neg = criar_usuario_com_negocio("foto@dest.com", plano="pro")
        prod_sem_foto = criar_produto(neg, "Sem Foto")   # ordem=0 por padrão → viria primeiro sem foto-priorização
        prod_com_foto = Produto.objects.create(
            negocio=neg, nome="Com Foto", disponivel=True,
            foto="uploads/produto/test.jpg", ordem=99,
        )

        response = self.client.get(self.URL)
        slugs_produtos = [p["slug"] for p in response.data]
        self.assertIn(prod_com_foto.slug, slugs_produtos)
        self.assertNotIn(prod_sem_foto.slug, slugs_produtos)

    # ── Parâmetro limit ───────────────────────────────────────────────────
    def test_limit_padrao_retorna_ate_dez(self):
        for i in range(10):
            _, neg = criar_usuario_com_negocio(f"lim{i}@dest.com", plano="pro")
            criar_produto(neg)
        response = self.client.get(self.URL)
        self.assertLessEqual(len(response.data), 10)

    def test_limit_personalizado(self):
        response = self.client.get(self.URL + "?limit=2")
        self.assertEqual(len(response.data), 2)

    def test_limit_maximo_20(self):
        for i in range(22):
            _, neg = criar_usuario_com_negocio(f"m{i:03d}@d.com", plano="pro")
            criar_produto(neg)
        response = self.client.get(self.URL + "?limit=999")
        self.assertLessEqual(len(response.data), 20)
