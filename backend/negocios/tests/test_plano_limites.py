"""
Testes de limites de plano para produtos e fotos de produto — PLANO_CONFIG.

Cobre:
  Grupo 1 — Limite de produtos por plano (gratuito / pro / producao)
  Grupo 2 — Limite de fotos por produto por plano
  Grupo 3 — Permissão de vídeo YouTube por plano
  Grupo 4 — Validação de URL de vídeo YouTube

Executar:
    python manage.py test negocios.tests.test_plano_limites --verbosity=2
"""

import re

from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status

from usuarios.models import User
from categorias.models import Categoria
from negocios.models import Negocio, Produto, FotoProduto, PLANO_CONFIG

# ─── Header JPEG mínimo que passa validação de magic bytes ───────────────────
JPEG_HEADER = (
    b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00'
    b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t'
    b'\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a'
    b'\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\x1eB'
    b'\xad\xc5=34\xb9\x02\x14\xb4\xd2\x04\xd0' + b'\x00' * 500
    + b'\xff\xd9'
)

URL_PRODUTOS = "/api/negocios/painel/produtos/"


# ─── Helpers ─────────────────────────────────────────────────────────────────

def criar_usuario_com_negocio(email: str, plano: str = "gratuito") -> tuple:
    """Cria User + Categoria + Negocio prontos para uso em testes."""
    user = User.objects.create_user(email=email, password="Senha@1234", nome="Teste")
    slug_cat = f"cat-{email.split('@')[0].replace('.', '-').replace('+', '-')}"
    categoria, _ = Categoria.objects.get_or_create(
        slug=slug_cat,
        defaults={"nome": f"Cat {email[:8]}"},
    )
    negocio = Negocio.objects.create(
        usuario=user,
        nome=f"Negócio {email}",
        categoria=categoria,
        cidade="Criciuma",
        whatsapp="48999990000",
        plano=plano,
        status=Negocio.Status.ATIVO,
    )
    return user, negocio


def criar_produto(negocio: Negocio, nome: str = "Produto Teste") -> Produto:
    """Cria um produto disponível vinculado ao negócio."""
    from django.utils import timezone
    return Produto.objects.create(
        negocio=negocio,
        nome=nome,
        disponivel=True,
        confirmado_em=timezone.now(),
    )


def foto_jpeg_valida(nome: str = "foto.jpg") -> SimpleUploadedFile:
    return SimpleUploadedFile(nome, JPEG_HEADER, content_type="image/jpeg")


def payload_produto(nome: str = "Produto Novo") -> dict:
    return {"nome": nome, "descricao": "Descricao do produto.", "preco": "10.00"}


# ─── Grupo 1: Limite de produtos por plano ───────────────────────────────────

@override_settings(DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage",
                   MEDIA_ROOT="/tmp/descubrasul_test_media/")
class LimiteProdutosGratuitoTests(TestCase):
    """Plano gratuito: limite de 5 produtos."""

    def setUp(self):
        self.client = APIClient()
        self.user, self.negocio = criar_usuario_com_negocio("grat+lim@test.com", plano="gratuito")
        self.client.force_authenticate(user=self.user)
        # Preenche o limite
        for i in range(5):
            criar_produto(self.negocio, nome=f"Produto {i}")

    def test_gratuito_limite_5_produtos(self):
        """6º produto deve retornar 403 para plano gratuito (PodicionarProduto permission)."""
        response = self.client.post(URL_PRODUTOS, payload_produto("6th"), format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_gratuito_5_produtos_ok(self):
        """Com 4 produtos criados na base, o 5º deve ter sido criado com sucesso no setUp."""
        # Verifica que chegamos no limite sem erro: o setUp criou 5 sem erro
        total = self.negocio.produtos.filter(disponivel=True).count()
        self.assertEqual(total, 5)
        self.assertFalse(self.negocio.pode_adicionar_produto)


@override_settings(DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage",
                   MEDIA_ROOT="/tmp/descubrasul_test_media/")
class LimiteProdutosProTests(TestCase):
    """Plano pro: limite de 5 produtos."""

    def setUp(self):
        self.client = APIClient()
        self.user, self.negocio = criar_usuario_com_negocio("pro+lim@test.com", plano="pro")
        self.client.force_authenticate(user=self.user)
        for i in range(5):
            criar_produto(self.negocio, nome=f"Produto {i}")

    def test_pro_limite_5_produtos(self):
        """6º produto deve retornar 403 para plano pro (PodicionarProduto permission)."""
        response = self.client.post(URL_PRODUTOS, payload_produto("6th"), format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage",
                   MEDIA_ROOT="/tmp/descubrasul_test_media/")
class LimiteProdutosProducaoTests(TestCase):
    """Plano producao: limite de 10 produtos."""

    def setUp(self):
        self.client = APIClient()
        self.user, self.negocio = criar_usuario_com_negocio("prod+lim@test.com", plano="producao")
        self.client.force_authenticate(user=self.user)
        for i in range(10):
            criar_produto(self.negocio, nome=f"Produto {i}")

    def test_producao_limite_10_produtos(self):
        """11º produto deve retornar 403 para plano producao (PodicionarProduto permission)."""
        response = self.client.post(URL_PRODUTOS, payload_produto("11th"), format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_producao_10_produtos_ok(self):
        """10 produtos criados com sucesso — não bloqueados pelo limite."""
        total = self.negocio.produtos.filter(disponivel=True).count()
        self.assertEqual(total, 10)
        self.assertFalse(self.negocio.pode_adicionar_produto)


# ─── Grupo 2: Limite de fotos por produto por plano ─────────────────────────

@override_settings(DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage",
                   MEDIA_ROOT="/tmp/descubrasul_test_media/")
class LimiteFotosProdutoGratuitoTests(TestCase):
    """Plano gratuito: máximo 1 foto por produto."""

    def setUp(self):
        self.client = APIClient()
        self.user, self.negocio = criar_usuario_com_negocio("grat+foto@test.com", plano="gratuito")
        self.client.force_authenticate(user=self.user)
        self.produto = criar_produto(self.negocio)
        # Preenche o limite de 1 foto diretamente no banco
        FotoProduto.objects.create(
            produto=self.produto,
            foto="uploads/fotoproduto/fake-uuid-0.jpg",
            alt_texto="",
            ordem=0,
        )

    def test_gratuito_limite_1_foto_produto(self):
        """2ª foto deve retornar 400 para plano gratuito."""
        url = f"{URL_PRODUTOS}{self.produto.pk}/fotos/"
        response = self.client.post(url, {"foto": foto_jpeg_valida()}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("1", response.data["detail"])

    def test_limite_fotos_produto_property_gratuito(self):
        """Property limite_fotos_produto retorna 1 para plano gratuito."""
        self.assertEqual(self.negocio.limite_fotos_produto, 1)


@override_settings(DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage",
                   MEDIA_ROOT="/tmp/descubrasul_test_media/")
class LimiteFotosProdutoProTests(TestCase):
    """Plano pro: máximo 3 fotos por produto."""

    def setUp(self):
        self.client = APIClient()
        self.user, self.negocio = criar_usuario_com_negocio("pro+foto@test.com", plano="pro")
        self.client.force_authenticate(user=self.user)
        self.produto = criar_produto(self.negocio)
        # Preenche o limite de 3 fotos
        for i in range(3):
            FotoProduto.objects.create(
                produto=self.produto,
                foto=f"uploads/fotoproduto/fake-uuid-{i}.jpg",
                alt_texto="",
                ordem=i,
            )

    def test_pro_limite_3_fotos_produto(self):
        """4ª foto deve retornar 400 para plano pro."""
        url = f"{URL_PRODUTOS}{self.produto.pk}/fotos/"
        response = self.client.post(url, {"foto": foto_jpeg_valida()}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("3", response.data["detail"])

    def test_limite_fotos_produto_property_pro(self):
        """Property limite_fotos_produto retorna 3 para plano pro."""
        self.assertEqual(self.negocio.limite_fotos_produto, 3)


# ─── Grupo 3: Permissão de vídeo YouTube por plano ──────────────────────────

@override_settings(DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage",
                   MEDIA_ROOT="/tmp/descubrasul_test_media/")
class VideoYouTubePermissaoTests(TestCase):
    """Verifica que vídeos YouTube só são aceitos no plano producao."""

    def setUp(self):
        self.client = APIClient()

    def test_producao_pode_adicionar_video(self):
        """video_youtube_url válida aceita no plano producao."""
        user, negocio = criar_usuario_com_negocio("prod+vid@test.com", plano="producao")
        self.client.force_authenticate(user=user)
        produto = criar_produto(negocio)

        payload = {
            "nome": produto.nome,
            "descricao": "Descricao.",
            "video_youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        }
        url = f"{URL_PRODUTOS}{produto.pk}/"
        response = self.client.patch(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data.get("video_youtube_url"),
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        )

    def test_gratuito_nao_pode_adicionar_video(self):
        """video_youtube_url rejeitada no plano gratuito — deve retornar 400."""
        user, negocio = criar_usuario_com_negocio("grat+vid@test.com", plano="gratuito")
        self.client.force_authenticate(user=user)
        produto = criar_produto(negocio)

        payload = {
            "nome": produto.nome,
            "descricao": "Descricao.",
            "video_youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        }
        url = f"{URL_PRODUTOS}{produto.pk}/"
        response = self.client.patch(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("video_youtube_url", response.data)

    def test_pro_nao_pode_adicionar_video(self):
        """video_youtube_url rejeitada no plano pro — deve retornar 400."""
        user, negocio = criar_usuario_com_negocio("pro+vid@test.com", plano="pro")
        self.client.force_authenticate(user=user)
        produto = criar_produto(negocio)

        payload = {
            "nome": produto.nome,
            "descricao": "Descricao.",
            "video_youtube_url": "https://youtu.be/dQw4w9WgXcQ",
        }
        url = f"{URL_PRODUTOS}{produto.pk}/"
        response = self.client.patch(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("video_youtube_url", response.data)

    def test_permite_video_property(self):
        """Property permite_video reflete corretamente PLANO_CONFIG."""
        _, negocio_grat = criar_usuario_com_negocio("prop+grat@test.com", plano="gratuito")
        _, negocio_pro  = criar_usuario_com_negocio("prop+pro@test.com",  plano="pro")
        _, negocio_prod = criar_usuario_com_negocio("prop+prod@test.com", plano="producao")

        self.assertFalse(negocio_grat.permite_video)
        self.assertFalse(negocio_pro.permite_video)
        self.assertTrue(negocio_prod.permite_video)


# ─── Grupo 4: Validação de URL de vídeo YouTube ──────────────────────────────

@override_settings(DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage",
                   MEDIA_ROOT="/tmp/descubrasul_test_media/")
class VideoURLValidacaoTests(TestCase):
    """Verifica que URLs inválidas são rejeitadas mesmo no plano producao."""

    def setUp(self):
        self.client = APIClient()
        self.user, self.negocio = criar_usuario_com_negocio("prod+urlval@test.com", plano="producao")
        self.client.force_authenticate(user=self.user)
        self.produto = criar_produto(self.negocio)

    def _patch_video(self, url: str):
        return self.client.patch(
            f"{URL_PRODUTOS}{self.produto.pk}/",
            {"nome": self.produto.nome, "descricao": "Descricao.", "video_youtube_url": url},
            format="json",
        )

    def test_video_url_invalida_rejeitada_vimeo(self):
        """URL de Vimeo deve ser rejeitada."""
        response = self._patch_video("https://vimeo.com/123456789")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("video_youtube_url", response.data)

    def test_video_url_invalida_rejeitada_texto_aleatorio(self):
        """String aleatória deve ser rejeitada."""
        response = self._patch_video("nao-e-uma-url")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("video_youtube_url", response.data)

    def test_video_url_invalida_rejeitada_youtube_sem_id(self):
        """URL YouTube sem ID de 11 chars deve ser rejeitada."""
        response = self._patch_video("https://www.youtube.com/watch?v=curto")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_video_url_valida_youtu_be(self):
        """Formato youtu.be/ID aceito no plano producao."""
        response = self._patch_video("https://youtu.be/dQw4w9WgXcQ")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_video_url_vazia_aceita(self):
        """Campo vazio deve ser aceito (limpa o vídeo)."""
        response = self._patch_video("")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_video_url_ausente_nao_altera(self):
        """PATCH sem video_youtube_url não deve alterar o campo."""
        self.produto.video_youtube_url = "https://youtu.be/dQw4w9WgXcQ"
        self.produto.save(update_fields=["video_youtube_url"])

        response = self.client.patch(
            f"{URL_PRODUTOS}{self.produto.pk}/",
            {"nome": self.produto.nome},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.produto.refresh_from_db()
        self.assertEqual(self.produto.video_youtube_url, "https://youtu.be/dQw4w9WgXcQ")


# ─── Grupo 5: PLANO_CONFIG consistência ──────────────────────────────────────

class PlanoConfigConsistenciaTests(TestCase):
    """Verifica que PLANO_CONFIG tem todas as chaves obrigatórias."""

    CHAVES_OBRIGATORIAS = {"limite_produtos", "fotos_por_produto", "permite_video", "limite_produtos_publico"}

    def test_todos_planos_tem_chaves_obrigatorias(self):
        for plano, config in PLANO_CONFIG.items():
            for chave in self.CHAVES_OBRIGATORIAS:
                self.assertIn(
                    chave, config,
                    msg=f"PLANO_CONFIG['{plano}'] não tem a chave '{chave}'",
                )

    def test_limites_produtos_derivados_de_plano_config(self):
        """LIMITES_PRODUTOS deve ser derivado de PLANO_CONFIG."""
        from negocios.models import LIMITES_PRODUTOS
        for plano, config in PLANO_CONFIG.items():
            self.assertEqual(
                LIMITES_PRODUTOS.get(plano),
                config["limite_produtos"],
                msg=f"LIMITES_PRODUTOS['{plano}'] diverge de PLANO_CONFIG",
            )

    def test_gratuito_nao_permite_video(self):
        self.assertFalse(PLANO_CONFIG["gratuito"]["permite_video"])

    def test_producao_permite_video(self):
        self.assertTrue(PLANO_CONFIG["producao"]["permite_video"])
