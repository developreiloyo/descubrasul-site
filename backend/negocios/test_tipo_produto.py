"""
Testes TDD para o campo tipo_produto no modelo Produto.

Cobre:
  Grupo 1 — Retrocompatibilidade
  Grupo 2 — Campo writable no painel
  Grupo 3 — Validação SEO (keyword stuffing)
  Grupo 4 — Endpoint de sugestões tipos_sugeridos
  Grupo 5 — Isolamento entre usuários no endpoint de sugestões

Executar:
    python manage.py test negocios.test_tipo_produto --verbosity=2
"""
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status

from usuarios.models import User
from categorias.models import Categoria
from .models import Negocio, Produto


# ─── Helpers ──────────────────────────────────────────────────────────────────

def criar_usuario_com_negocio(email: str, plano: str = "gratuito",
                               categoria_slug: str = None) -> tuple[User, Negocio]:
    """Cria User + Categoria + Negocio. Reutiliza categoria se slug passado."""
    user = User.objects.create_user(email=email, password="Senha@1234", nome="Teste")
    if categoria_slug:
        categoria = Categoria.objects.get_or_create(
            slug=categoria_slug,
            defaults={"nome": f"Cat {categoria_slug}"},
        )[0]
    else:
        safe_slug = email.replace("@", "-").replace(".", "-")[:20]
        categoria = Categoria.objects.create(
            nome=f"Cat {email[:8]}", slug=f"cat-{safe_slug}"
        )
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


def criar_produto(negocio: Negocio, nome: str = "Produto X",
                  tipo_produto: str = None) -> Produto:
    return Produto.objects.create(
        negocio=negocio,
        nome=nome,
        disponivel=True,
        tipo_produto=tipo_produto,
    )


# ─── Grupo 1: Retrocompatibilidade ────────────────────────────────────────────

class TipoProdutoRetrocompatibilidadeTests(TestCase):
    """
    Produtos existentes sem tipo_produto (NULL) não devem quebrar
    nenhuma serialização nem operação de escrita.
    """

    URL_PUBLIC_DESTAQUE = "/api/negocios/produtos/destaque/"
    URL_PAINEL_LIST = "/api/negocios/painel/produtos/"

    def setUp(self):
        self.client = APIClient()
        self.user, self.negocio = criar_usuario_com_negocio("retro@test.com", plano="basico")
        # Produto sem tipo_produto (NULL — cenário pré-migração)
        self.produto_null = Produto.objects.create(
            negocio=self.negocio,
            nome="Produto Legado",
            disponivel=True,
            tipo_produto=None,
        )

    # 1.1 — Serializer público não explode com tipo_produto=NULL
    @override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}})
    def test_produto_sem_tipo_produto_serializavel_publico(self):
        """ProdutoPublicoSerializer aceita tipo_produto=NULL sem erro."""
        response = self.client.get(self.URL_PUBLIC_DESTAQUE)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = [p["slug"] for p in response.data]
        self.assertIn(self.produto_null.slug, slugs)
        # Verifica que o campo aparece como None (null JSON), não ausente
        produto_data = next(p for p in response.data if p["slug"] == self.produto_null.slug)
        self.assertIn("tipo_produto", produto_data)
        self.assertIsNone(produto_data["tipo_produto"])

    # 1.2 — PATCH sem tipo_produto no payload não sobrescreve com vazio
    def test_patch_sem_tipo_produto_nao_sobrescreve(self):
        """PATCH sem o campo tipo_produto não modifica o valor atual."""
        self.produto_null.tipo_produto = "Valor Existente"
        self.produto_null.save(update_fields=["tipo_produto"])

        self.client.force_authenticate(user=self.user)
        url = f"{self.URL_PAINEL_LIST}{self.produto_null.pk}/"
        response = self.client.patch(url, {"nome": "Nome Atualizado"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.produto_null.refresh_from_db()
        self.assertEqual(self.produto_null.tipo_produto, "Valor Existente",
                         "PATCH sem tipo_produto no payload não deve sobrescrever o campo.")

    # 1.3 — Criar produto novo sem tipo_produto funciona igual ao comportamento anterior
    def test_criar_produto_sem_tipo_produto_funciona(self):
        """POST sem tipo_produto cria o produto com tipo_produto=NULL."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.URL_PAINEL_LIST,
            {"nome": "Produto Novo Sem Tipo"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        novo = Produto.objects.get(pk=response.data["id"])
        self.assertIsNone(novo.tipo_produto)


# ─── Grupo 2: Campo writable no painel ────────────────────────────────────────

class TipoProdutoPainelWritableTests(TestCase):
    """
    tipo_produto deve ser gravável via PATCH e visível no GET do painel.
    """

    URL_PAINEL_LIST = "/api/negocios/painel/produtos/"

    def setUp(self):
        self.client = APIClient()
        self.user, self.negocio = criar_usuario_com_negocio("painel@test.com")
        self.produto = criar_produto(self.negocio, "Produto Editável")
        self.client.force_authenticate(user=self.user)
        self.url_detail = f"{self.URL_PAINEL_LIST}{self.produto.pk}/"

    # 2.1 — PATCH com valor válido salva corretamente
    def test_patch_tipo_produto_salva_corretamente(self):
        response = self.client.patch(self.url_detail, {"tipo_produto": "Pizza"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.produto.refresh_from_db()
        self.assertEqual(self.produto.tipo_produto, "Pizza")

    # 2.2 — PATCH com string vazia é aceito (blank=True)
    def test_patch_tipo_produto_string_vazia_aceita(self):
        self.produto.tipo_produto = "Valor Prévio"
        self.produto.save(update_fields=["tipo_produto"])

        response = self.client.patch(self.url_detail, {"tipo_produto": ""}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK,
                         f"String vazia deve ser aceita (blank=True). Resposta: {response.data}")
        self.produto.refresh_from_db()
        self.assertEqual(self.produto.tipo_produto, "")

    # 2.3 — PATCH com None não quebra (campo ausente no payload)
    def test_patch_tipo_produto_none_nao_quebra(self):
        """PATCH com tipo_produto=None explícito deve ser aceito sem erro 500."""
        response = self.client.patch(self.url_detail, {"tipo_produto": None}, format="json")
        # null é válido porque o campo tem null=True
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST],
                      "PATCH com None não deve causar erro 500")
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    # 2.4 — Campo ausente no payload não quebra (sem tipo_produto na request)
    def test_patch_sem_campo_nao_quebra(self):
        """PATCH sem tipo_produto no payload retorna 200."""
        response = self.client.patch(self.url_detail, {"nome": "Outro Nome"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # 2.5 — tipo_produto aparece no GET do painel
    def test_get_painel_inclui_tipo_produto(self):
        self.produto.tipo_produto = "Pizza Margherita"
        self.produto.save(update_fields=["tipo_produto"])

        response = self.client.get(self.url_detail)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("tipo_produto", response.data)
        self.assertEqual(response.data["tipo_produto"], "Pizza Margherita")

    # 2.6 — tipo_produto aparece na listagem do painel
    def test_lista_painel_inclui_tipo_produto(self):
        self.produto.tipo_produto = "Hamburguer Artesanal"
        self.produto.save(update_fields=["tipo_produto"])

        response = self.client.get(self.URL_PAINEL_LIST)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        items = response.data.get("results", response.data)
        produto_data = next((p for p in items if p["id"] == self.produto.pk), None)
        self.assertIsNotNone(produto_data, "Produto não encontrado na listagem")
        self.assertIn("tipo_produto", produto_data)
        self.assertEqual(produto_data["tipo_produto"], "Hamburguer Artesanal")


# ─── Grupo 3: Validação SEO ────────────────────────────────────────────────────

class TipoProdutoValidacaoSEOTests(TestCase):
    """
    validate_tipo_produto deve rejeitar keyword stuffing via
    validar_texto_seo_completo e aceitar valores normais.
    """

    URL_PAINEL_LIST = "/api/negocios/painel/produtos/"

    def setUp(self):
        self.client = APIClient()
        self.user, self.negocio = criar_usuario_com_negocio("seo@test.com")
        self.produto = criar_produto(self.negocio, "Produto SEO")
        self.client.force_authenticate(user=self.user)
        self.url_detail = f"{self.URL_PAINEL_LIST}{self.produto.pk}/"

    # 3.1 — Keyword stuffing retorna 400
    def test_keyword_stuffing_retorna_400(self):
        """
        'pizza pizza pizza pizza pizza' tem repetição >= 4 e densidade > 15%.
        Deve retornar 400 com mensagem de erro no campo tipo_produto.
        """
        valor_stuffed = "pizza pizza pizza pizza pizza"
        response = self.client.patch(
            self.url_detail, {"tipo_produto": valor_stuffed}, format="json"
        )
        self.assertEqual(
            response.status_code, status.HTTP_400_BAD_REQUEST,
            f"Keyword stuffing deveria retornar 400. Resposta: {response.data}",
        )
        self.assertIn("tipo_produto", response.data,
                      "Erro deve estar no campo tipo_produto")

    # 3.2 — Valor normal passa validação
    def test_valor_normal_passa_validacao(self):
        """'Pizza margherita' é um valor legítimo — deve passar."""
        response = self.client.patch(
            self.url_detail, {"tipo_produto": "Pizza margherita"}, format="json"
        )
        self.assertEqual(
            response.status_code, status.HTTP_200_OK,
            f"Valor normal rejeitado inesperadamente: {response.data}",
        )
        self.produto.refresh_from_db()
        self.assertEqual(self.produto.tipo_produto, "Pizza margherita")

    # 3.3 — Frase genérica proibida retorna 400
    def test_frase_generica_retorna_400(self):
        """
        'melhor atendimento da região' está na lista FRASES_GENERICAS
        do validador SEO — deve ser rejeitada.
        """
        response = self.client.patch(
            self.url_detail,
            {"tipo_produto": "melhor atendimento da região"},
            format="json",
        )
        self.assertEqual(
            response.status_code, status.HTTP_400_BAD_REQUEST,
            f"Frase genérica deveria retornar 400. Resposta: {response.data}",
        )

    # 3.4 — String vazia não passa por validação (blank=True, validate só se houver valor)
    def test_string_vazia_nao_valida_seo(self):
        """
        validate_tipo_produto usa 'if value:' — string vazia deve ser aceita
        sem acionar a validação SEO.
        """
        response = self.client.patch(
            self.url_detail, {"tipo_produto": ""}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK,
                         "String vazia deve ser aceita sem validação SEO.")

    # 3.5 — None não passa por validação SEO (null=True)
    def test_none_nao_aciona_validacao_seo(self):
        """None não deve acionar validar_texto_seo_completo."""
        response = self.client.patch(
            self.url_detail, {"tipo_produto": None}, format="json"
        )
        # null é válido (null=True) — não deve retornar 400 por SEO
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            # Se houver erro, NÃO deve ser de SEO/keyword
            self.assertNotIn("palavra", str(response.data).lower(),
                             "None não deve acionar validação de keyword stuffing")


# ─── Grupo 4: Endpoint de sugestões ───────────────────────────────────────────

@override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}})
class TiposSugeridosEndpointTests(TestCase):
    """
    GET /api/negocios/painel/produtos/tipos_sugeridos/?categoria=<slug>
    """

    URL = "/api/negocios/painel/produtos/tipos_sugeridos/"

    def setUp(self):
        self.client = APIClient()
        # Categorias: usa get_or_create pois a migração 0002_seed_categorias
        # já pode ter inserido "restaurantes" e "moda" na base de teste.
        self.cat_restaurantes, _ = Categoria.objects.get_or_create(
            slug="restaurantes", defaults={"nome": "Restaurantes"}
        )
        self.cat_moda, _ = Categoria.objects.get_or_create(
            slug="moda", defaults={"nome": "Moda"}
        )

        # user_a — negócio em restaurantes
        self.user_a, self.negocio_a = criar_usuario_com_negocio(
            "sug_a@test.com", categoria_slug="restaurantes"
        )
        # user_b — negócio em moda
        self.user_b, self.negocio_b = criar_usuario_com_negocio(
            "sug_b@test.com", categoria_slug="moda"
        )

        # Produtos com tipo_produto em restaurantes
        criar_produto(self.negocio_a, "Margherita",   tipo_produto="Pizza")
        criar_produto(self.negocio_a, "Napolitana",   tipo_produto="Pizza")  # duplicado
        criar_produto(self.negocio_a, "Frango",       tipo_produto="Prato Principal")
        criar_produto(self.negocio_a, "Sem Tipo",     tipo_produto=None)
        criar_produto(self.negocio_a, "Vazio",        tipo_produto="")

        # Produto em moda (não deve aparecer em consulta de restaurantes)
        criar_produto(self.negocio_b, "Camiseta",     tipo_produto="Camiseta")

    # 4.1 — Retorna 200 com estrutura correta
    def test_retorna_200_com_estrutura_correta(self):
        response = self.client.get(self.URL, {"categoria": "restaurantes"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("sugerencias", response.data)
        self.assertIsInstance(response.data["sugerencias"], list)

    # 4.2 — Não requer autenticação (endpoint público)
    def test_sem_autenticacao_retorna_200(self):
        """Endpoint não requer JWT."""
        response = self.client.get(self.URL, {"categoria": "restaurantes"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # 4.3 — Apenas valores não-nulos e não-vazios
    def test_nao_inclui_nulos_nem_vazios(self):
        response = self.client.get(self.URL, {"categoria": "restaurantes"})
        sugerencias = response.data["sugerencias"]
        for s in sugerencias:
            self.assertIsNotNone(s, "tipo_produto=NULL não deve aparecer nas sugestões")
            self.assertNotEqual(s, "", "tipo_produto='' não deve aparecer nas sugestões")

    # 4.4 — Distinct: duplicados não aparecem duplicados
    def test_valores_distintos_sem_duplicados(self):
        response = self.client.get(self.URL, {"categoria": "restaurantes"})
        sugerencias = response.data["sugerencias"]
        self.assertEqual(len(sugerencias), len(set(sugerencias)),
                         "Sugestões contêm duplicados — deveria usar .distinct()")

    # 4.5 — Filtra por categoria: outra categoria não vaza
    def test_filtra_por_categoria_sem_vazar_outras(self):
        response = self.client.get(self.URL, {"categoria": "restaurantes"})
        sugerencias = response.data["sugerencias"]
        self.assertNotIn("Camiseta", sugerencias,
                         "tipo_produto de outra categoria não deve aparecer")

    # 4.6 — Categoria sem produtos retorna lista vazia
    def test_categoria_sem_produtos_retorna_lista_vazia(self):
        Categoria.objects.create(nome="Vazia", slug="categoria-vazia")
        response = self.client.get(self.URL, {"categoria": "categoria-vazia"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["sugerencias"], [])

    # 4.7 — Sem parâmetro categoria retorna lista vazia (não erro)
    def test_sem_parametro_categoria_retorna_lista_vazia(self):
        response = self.client.get(self.URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["sugerencias"], [])

    # 4.8 — Máximo 30 resultados
    def test_maximo_30_resultados(self):
        """Com mais de 30 tipo_produto distintos, retorna no máximo 30."""
        for i in range(35):
            criar_produto(self.negocio_a, f"Prod {i}", tipo_produto=f"Tipo Unico {i:03d}")

        response = self.client.get(self.URL, {"categoria": "restaurantes"})
        self.assertLessEqual(len(response.data["sugerencias"]), 30,
                             "Deve limitar a 30 resultados")

    # 4.9 — Valores corretos retornados para a categoria
    def test_retorna_valores_corretos_da_categoria(self):
        response = self.client.get(self.URL, {"categoria": "restaurantes"})
        sugerencias = response.data["sugerencias"]
        self.assertIn("Pizza", sugerencias)
        self.assertIn("Prato Principal", sugerencias)

    # 4.10 — Categoria inexistente retorna lista vazia (não 404)
    def test_categoria_inexistente_retorna_lista_vazia(self):
        response = self.client.get(self.URL, {"categoria": "nao-existe"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["sugerencias"], [])


# ─── Grupo 5: Isolamento entre usuários (sugestões agregadas) ─────────────────

@override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}})
class TiposSugeridosIsolamentoTests(TestCase):
    """
    O endpoint de sugestões retorna strings agregadas, não objetos de negócio.
    Verifica que nenhum dado identificável de negócio específico vaza.
    """

    URL = "/api/negocios/painel/produtos/tipos_sugeridos/"

    def setUp(self):
        self.client = APIClient()
        # get_or_create: a migração de seed pode ter inserido "restaurantes" previamente
        Categoria.objects.get_or_create(
            slug="restaurantes",
            defaults={"nome": "Restaurantes"},
        )
        self.user_a, self.negocio_a = criar_usuario_com_negocio(
            "iso_a@test.com", categoria_slug="restaurantes"
        )
        self.user_b, self.negocio_b = criar_usuario_com_negocio(
            "iso_b@test.com", categoria_slug="restaurantes"
        )
        criar_produto(self.negocio_a, "Prod A", tipo_produto="Pizza")
        criar_produto(self.negocio_b, "Prod B", tipo_produto="Hamburguer")

    # 5.1 — Resposta é lista de strings, sem nenhum id de negócio
    def test_resposta_nao_contem_ids_de_negocio(self):
        response = self.client.get(self.URL, {"categoria": "restaurantes"})
        sugerencias = response.data["sugerencias"]
        # Cada sugestão deve ser string, não objeto
        for s in sugerencias:
            self.assertIsInstance(s, str,
                                  f"Sugestão deve ser string, não objeto: {s}")

    # 5.2 — Resposta não inclui chaves identificáveis de negócio
    def test_resposta_nao_contem_slug_negocio(self):
        response = self.client.get(self.URL, {"categoria": "restaurantes"})
        raw = str(response.data)
        self.assertNotIn(self.negocio_a.slug, raw,
                         "Slug do negócio A não deve aparecer na resposta")
        self.assertNotIn(self.negocio_b.slug, raw,
                         "Slug do negócio B não deve aparecer na resposta")

    # 5.3 — Resposta não inclui o nome do negócio
    def test_resposta_nao_contem_nome_negocio(self):
        response = self.client.get(self.URL, {"categoria": "restaurantes"})
        raw = str(response.data)
        self.assertNotIn(self.negocio_a.nome, raw)
        self.assertNotIn(self.negocio_b.nome, raw)

    # 5.4 — Usuário autenticado como A vê as mesmas sugestões que usuário B
    # (sugestões são públicas e agregadas — não dependem de quem pergunta)
    def test_sugestoes_identicas_independente_de_quem_pergunta(self):
        self.client.force_authenticate(user=self.user_a)
        resp_a = self.client.get(self.URL, {"categoria": "restaurantes"})

        self.client.force_authenticate(user=self.user_b)
        resp_b = self.client.get(self.URL, {"categoria": "restaurantes"})

        self.assertEqual(
            sorted(resp_a.data["sugerencias"]),
            sorted(resp_b.data["sugerencias"]),
            "Sugestões devem ser idênticas independente do usuário autenticado",
        )

    # 5.5 — Usuário sem autenticação vê as mesmas sugestões (endpoint público)
    def test_anonimo_ve_mesmas_sugestoes(self):
        self.client.force_authenticate(user=self.user_a)
        resp_auth = self.client.get(self.URL, {"categoria": "restaurantes"})

        self.client.force_authenticate(None)  # anônimo
        resp_anon = self.client.get(self.URL, {"categoria": "restaurantes"})

        self.assertEqual(
            sorted(resp_auth.data["sugerencias"]),
            sorted(resp_anon.data["sugerencias"]),
            "Endpoint público deve retornar as mesmas sugestões para anônimos e autenticados",
        )
