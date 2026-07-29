"""
Testes de isolamento e regras de negócio para a galeria de fotos do negócio.

Cobre:
  Grupo 1 — Controle de acesso por plano (gratuito vs. pro)
  Grupo 2 — Upload válido e respeito ao limite de 10 fotos
  Grupo 3 — Remoção de foto (própria e isolamento entre usuários)
  Grupo 4 — Listagem (apenas fotos do próprio negócio)

Executar:
    python manage.py test negocios.tests.test_galeria --verbosity=2
"""

from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile

from usuarios.models import User
from categorias.models import Categoria
from negocios.models import Negocio, FotoNegocio

# ─── Header JPEG mínimo que passa validação de magic bytes ────────────────────
# Estrutura JFIF completa: SOI + APP0 + DQT + EOI
JPEG_HEADER = (
    b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00'
    b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t'
    b'\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a'
    b'\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\x1eB'
    b'\xad\xc5=34\xb9\x02\x14\xb4\xd2\x04\xd0' + b'\x00' * 500
    + b'\xff\xd9'
)

URL_GALERIA = "/api/negocios/painel/galeria/"


# ─── Helpers ──────────────────────────────────────────────────────────────────

def criar_usuario_com_negocio(email: str, plano: str = "gratuito") -> tuple:
    """Cria User + Categoria + Negocio prontos para uso em testes."""
    user = User.objects.create_user(email=email, password="Senha@1234", nome="Teste")
    slug_cat = f"cat-{email.split('@')[0].replace('.', '-')}"
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


def foto_jpeg_valida(nome: str = "foto.jpg") -> SimpleUploadedFile:
    """Retorna um arquivo JPEG mínimo que passa a validação de magic bytes."""
    return SimpleUploadedFile(nome, JPEG_HEADER, content_type="image/jpeg")


# ─── Grupo 1: Controle de acesso por plano ────────────────────────────────────

@override_settings(DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage",
                   MEDIA_ROOT="/tmp/descubrasul_test_media/")
class GaleriaPlanoTests(TestCase):
    """Verifica que apenas planos Pro e Produção podem fazer upload."""

    def setUp(self):
        self.client = APIClient()

    def test_gratuito_nao_pode_fazer_upload(self):
        """POST de foto por negócio gratuito deve retornar 403."""
        user, _ = criar_usuario_com_negocio("gratuito@test.com", plano="gratuito")
        self.client.force_authenticate(user=user)

        response = self.client.post(
            URL_GALERIA,
            {"foto": foto_jpeg_valida()},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("Galeria de fotos", response.data["detail"])
        self.assertIn("upgrade", response.data["detail"])

    def test_pro_pode_fazer_upload(self):
        """POST com foto JPEG válida por plano pro deve retornar 201."""
        user, _ = criar_usuario_com_negocio("pro@test.com", plano="pro")
        self.client.force_authenticate(user=user)

        response = self.client.post(
            URL_GALERIA,
            {"foto": foto_jpeg_valida()},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertIn("foto", response.data)

    def test_producao_pode_fazer_upload(self):
        """POST com foto JPEG válida por plano producao deve retornar 201."""
        user, _ = criar_usuario_com_negocio("producao@test.com", plano="producao")
        self.client.force_authenticate(user=user)

        response = self.client.post(
            URL_GALERIA,
            {"foto": foto_jpeg_valida()},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_nao_autenticado_retorna_401(self):
        """Requisição sem JWT deve retornar 401."""
        response = self.client.post(
            URL_GALERIA,
            {"foto": foto_jpeg_valida()},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ─── Grupo 2: Upload válido e limite de fotos ─────────────────────────────────

@override_settings(DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage",
                   MEDIA_ROOT="/tmp/descubrasul_test_media/")
class GaleriaLimiteTests(TestCase):
    """Verifica que o limite de 10 fotos é respeitado."""

    def setUp(self):
        self.client = APIClient()
        self.user, self.negocio = criar_usuario_com_negocio("limite@test.com", plano="pro")
        self.client.force_authenticate(user=self.user)

    def test_pro_respeita_limite_10_fotos(self):
        """A 11ª foto de um plano Pro deve retornar 400."""
        # Preenche o limite diretamente no banco (sem chamada HTTP)
        for i in range(10):
            FotoNegocio.objects.create(
                negocio=self.negocio,
                foto=f"uploads/fotonegocio/fake-uuid-{i}.jpg",
                alt_texto="",
                ordem=i,
            )

        response = self.client.post(
            URL_GALERIA,
            {"foto": foto_jpeg_valida()},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Limite de 10 fotos", response.data["detail"])

    def test_upload_sem_foto_retorna_400(self):
        """POST sem o campo 'foto' deve retornar 400."""
        response = self.client.post(URL_GALERIA, {}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("obrigatória", response.data["detail"])

    def test_upload_arquivo_invalido_retorna_400(self):
        """Arquivo de texto com extensão .jpg deve ser rejeitado por magic bytes."""
        arquivo_falso = SimpleUploadedFile(
            "malicioso.jpg", b"isto nao e um jpeg", content_type="image/jpeg"
        )
        response = self.client.post(
            URL_GALERIA,
            {"foto": arquivo_falso},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_alt_texto_truncado_a_125_chars(self):
        """alt_texto maior que 125 chars é truncado silenciosamente."""
        alt_longo = "x" * 200
        response = self.client.post(
            URL_GALERIA,
            {"foto": foto_jpeg_valida(), "alt_texto": alt_longo},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        foto = FotoNegocio.objects.get(pk=response.data["id"])
        self.assertLessEqual(len(foto.alt_texto), 125)


# ─── Grupo 3: Remoção de foto ─────────────────────────────────────────────────

@override_settings(DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage",
                   MEDIA_ROOT="/tmp/descubrasul_test_media/")
class GaleriaDeletarTests(TestCase):
    """Verifica DELETE e isolamento entre usuários."""

    def setUp(self):
        self.client = APIClient()
        self.user_a, self.negocio_a = criar_usuario_com_negocio("del_a@test.com", plano="pro")
        self.user_b, self.negocio_b = criar_usuario_com_negocio("del_b@test.com", plano="pro")

        # Foto pertencente ao negócio A
        self.foto_a = FotoNegocio.objects.create(
            negocio=self.negocio_a,
            foto="uploads/fotonegocio/fake-uuid-a.jpg",
            alt_texto="Foto do negócio A",
            ordem=0,
        )
        # Foto pertencente ao negócio B
        self.foto_b = FotoNegocio.objects.create(
            negocio=self.negocio_b,
            foto="uploads/fotonegocio/fake-uuid-b.jpg",
            alt_texto="Foto do negócio B",
            ordem=0,
        )

    def test_delete_remove_foto(self):
        """DELETE da própria foto deve retornar 204 e remover o registro."""
        self.client.force_authenticate(user=self.user_a)
        url = f"{URL_GALERIA}{self.foto_a.pk}/"

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(FotoNegocio.objects.filter(pk=self.foto_a.pk).exists())

    def test_delete_de_outro_usuario_retorna_404(self):
        """
        Usuário A tentando deletar foto do usuário B deve receber 404.
        Isolamento obrigatório — ISO 27001 §8.29.
        """
        self.client.force_authenticate(user=self.user_a)
        url = f"{URL_GALERIA}{self.foto_b.pk}/"

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        # Foto do B não foi removida
        self.assertTrue(FotoNegocio.objects.filter(pk=self.foto_b.pk).exists())

    def test_delete_foto_inexistente_retorna_404(self):
        """DELETE de pk inexistente deve retornar 404."""
        self.client.force_authenticate(user=self.user_a)
        url = f"{URL_GALERIA}999999/"

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ─── Grupo 4: Listagem ────────────────────────────────────────────────────────

@override_settings(DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage",
                   MEDIA_ROOT="/tmp/descubrasul_test_media/")
class GaleriaListagemTests(TestCase):
    """Verifica que o comerciante vê apenas suas próprias fotos."""

    def setUp(self):
        self.client = APIClient()
        self.user_a, self.negocio_a = criar_usuario_com_negocio("list_a@test.com", plano="pro")
        self.user_b, self.negocio_b = criar_usuario_com_negocio("list_b@test.com", plano="pro")

        # 2 fotos do negócio A
        self.foto_a1 = FotoNegocio.objects.create(
            negocio=self.negocio_a,
            foto="uploads/fotonegocio/a1.jpg",
            alt_texto="A1",
            ordem=0,
        )
        self.foto_a2 = FotoNegocio.objects.create(
            negocio=self.negocio_a,
            foto="uploads/fotonegocio/a2.jpg",
            alt_texto="A2",
            ordem=1,
        )
        # 1 foto do negócio B
        self.foto_b1 = FotoNegocio.objects.create(
            negocio=self.negocio_b,
            foto="uploads/fotonegocio/b1.jpg",
            alt_texto="B1",
            ordem=0,
        )

    def test_lista_fotos_do_proprio_negocio(self):
        """GET retorna apenas as fotos do negócio autenticado."""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(URL_GALERIA)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids_retornados = {f["id"] for f in response.data["fotos"]}
        self.assertIn(self.foto_a1.pk, ids_retornados)
        self.assertIn(self.foto_a2.pk, ids_retornados)
        # Foto do negócio B nunca deve aparecer
        self.assertNotIn(self.foto_b1.pk, ids_retornados)

    def test_resposta_inclui_campos_de_status(self):
        """GET retorna limite, total e pode_adicionar além das fotos."""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(URL_GALERIA)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("fotos", response.data)
        self.assertIn("limite", response.data)
        self.assertIn("total", response.data)
        self.assertIn("pode_adicionar", response.data)
        self.assertEqual(response.data["limite"], 10)
        self.assertEqual(response.data["total"], 2)
        self.assertTrue(response.data["pode_adicionar"])

    def test_gratuito_lista_vazia_sem_erro(self):
        """Plano gratuito pode listar (retorna 0 fotos + pode_adicionar=False)."""
        user_g, _ = criar_usuario_com_negocio("grat_list@test.com", plano="gratuito")
        self.client.force_authenticate(user=user_g)
        response = self.client.get(URL_GALERIA)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["fotos"], [])
        self.assertEqual(response.data["limite"], 0)
        self.assertFalse(response.data["pode_adicionar"])

    def test_nao_autenticado_retorna_401(self):
        """GET sem JWT deve retornar 401."""
        response = self.client.get(URL_GALERIA)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
