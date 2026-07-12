"""
Testes de isolamento entre usuários — endpoints de perfil.

MeView e ChangePasswordView operam sempre sobre request.user —
mas os testes garantem que user_a não altera dados de user_b
e que endpoints exigem autenticação.

NOTA: argon2-cffi está em requirements.txt mas não instalado no container de
desenvolvimento. Por isso, todos os tests desta suite usam PBKDF2 via
override_settings. Ver BUG #env-argon2 no relatório de QA.
"""
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status

from usuarios.models import User

# argon2-cffi ausente no container — usar PBKDF2 como workaround
PBKDF2_ONLY = {
    "PASSWORD_HASHERS": ["django.contrib.auth.hashers.PBKDF2PasswordHasher"]
}


def criar_usuario(email: str, nome: str = "Teste") -> User:
    return User.objects.create_user(email=email, password="Senha@1234", nome=nome)


@override_settings(**PBKDF2_ONLY)
class MeIsolamentoTests(TestCase):
    """GET/PATCH /api/usuarios/me/ — retorna e edita somente o usuário autenticado."""

    def setUp(self):
        self.client = APIClient()
        self.user_a = criar_usuario("a@me.com", nome="Usuario A")
        self.user_b = criar_usuario("b@me.com", nome="Usuario B")
        self.url = "/api/usuarios/me/"

    def test_get_retorna_usuario_proprio(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user_a.email)

    def test_get_nao_retorna_dados_de_outro_usuario(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(self.url)
        self.assertNotEqual(response.data["email"], self.user_b.email)

    def test_patch_atualiza_somente_usuario_autenticado(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.patch(self.url, {"nome": "Novo Nome"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user_b.refresh_from_db()
        self.assertNotEqual(self.user_b.nome, "Novo Nome")
        self.user_a.refresh_from_db()
        self.assertEqual(self.user_a.nome, "Novo Nome")

    def test_email_nao_pode_ser_alterado_via_patch(self):
        """email está em read_only_fields — não deve ser aceito."""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.patch(
            self.url,
            {"email": "hackeado@evil.com"},
            format="json",
        )
        self.user_a.refresh_from_db()
        self.assertNotEqual(self.user_a.email, "hackeado@evil.com")
        self.assertEqual(self.user_a.email, "a@me.com")

    def test_sem_autenticacao_retorna_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_sem_autenticacao_retorna_401(self):
        response = self.client.patch(self.url, {"nome": "Hack"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(**PBKDF2_ONLY)
class ChangePasswordIsolamentoTests(TestCase):
    """POST /api/usuarios/me/password/ — altera somente a senha do usuário autenticado."""

    def setUp(self):
        self.client = APIClient()
        self.user_a = criar_usuario("a@pwd.com")
        self.user_b = criar_usuario("b@pwd.com")
        self.url = "/api/usuarios/me/password/"

    def test_troca_senha_usuario_proprio(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.post(self.url, {
            "password_atual": "Senha@1234",
            "password_novo": "NovaSenha@9999",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user_a.refresh_from_db()
        self.assertTrue(self.user_a.check_password("NovaSenha@9999"))

    def test_senha_errada_retorna_400(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.post(self.url, {
            "password_atual": "SenhaErrada",
            "password_novo": "NovaSenha@9999",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_senha_de_outro_usuario_nao_e_alterada(self):
        """
        Mesmo que user_a tente fornecer senha de user_b, o endpoint
        opera sempre sobre request.user — não sobre outro usuário.
        """
        self.client.force_authenticate(user=self.user_a)
        self.client.post(self.url, {
            "password_atual": "Senha@1234",
            "password_novo": "Hackeado@9999",
        }, format="json")
        self.user_b.refresh_from_db()
        self.assertFalse(self.user_b.check_password("Hackeado@9999"))
        self.assertTrue(self.user_b.check_password("Senha@1234"))

    def test_sem_autenticacao_retorna_401(self):
        response = self.client.post(self.url, {
            "password_atual": "Senha@1234",
            "password_novo": "NovaSenha@9999",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(**PBKDF2_ONLY)
class ExcluirContaTests(TestCase):
    """DELETE /api/usuarios/me/delete/ — exclui somente a conta do usuário autenticado."""

    def setUp(self):
        self.client = APIClient()
        self.user_a = criar_usuario("a@del.com")
        self.user_b = criar_usuario("b@del.com")
        self.url = "/api/usuarios/me/delete/"

    def test_exclui_somente_conta_propria(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(pk=self.user_a.pk).exists())
        self.assertTrue(User.objects.filter(pk=self.user_b.pk).exists())

    def test_sem_autenticacao_retorna_401(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertTrue(User.objects.filter(pk=self.user_a.pk).exists())
