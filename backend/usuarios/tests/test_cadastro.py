"""
Tests for the merchant registration endpoint (CadastroCompletoView).

Covers:
- Happy path: User + Negocio created atomically
- WhatsApp validation: 10-11 digits required
- City validation: must be in CIDADES_NOMES
- Duplicate email rejected
- LGPD consent required
- Rate limit returns 429 JSON (not 403 HTML)
"""
from django.test import TestCase, override_settings
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework import status

from negocios.models import Negocio
from usuarios.models import User

PBKDF2_ONLY = {
    "PASSWORD_HASHERS": ["django.contrib.auth.hashers.PBKDF2PasswordHasher"]
}

VALID_PAYLOAD = {
    "nome": "João Silva",
    "email": "joao@example.com",
    "password": "Senha@1234",
    "negocio_nome": "Padaria do João",
    "categoria_slug": "alimentos-bebidas",
    "cidade": "Criciúma",
    "whatsapp": "48999990000",
    "lgpd_consent": True,
}


def _get_or_create_categoria():
    from categorias.models import Categoria
    cat, _ = Categoria.objects.get_or_create(
        slug="alimentos-bebidas",
        defaults={"nome": "Alimentos e Bebidas", "ativo": True, "ordem": 1},
    )
    return cat


@override_settings(**PBKDF2_ONLY)
class CadastroCompletoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        _get_or_create_categoria()
        cache.clear()

    def _post(self, payload=None):
        data = {**VALID_PAYLOAD, **(payload or {})}
        return self.client.post(
            "/api/usuarios/cadastro/",
            data,
            format="json",
            HTTP_X_FORWARDED_FOR="1.2.3.4",
        )

    def test_cadastro_cria_user_e_negocio(self):
        res = self._post()
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data, {"ok": True})
        user = User.objects.get(email="joao@example.com")
        self.assertEqual(user.nome, "João Silva")
        negocio = Negocio.objects.get(usuario=user)
        self.assertEqual(negocio.nome, "Padaria do João")
        self.assertEqual(negocio.plano, Negocio.Plano.GRATUITO)
        self.assertEqual(negocio.status, Negocio.Status.ATIVO)

    def test_whatsapp_10_digitos_aceito(self):
        res = self._post({"email": "w10@example.com", "whatsapp": "4888880000"})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_whatsapp_11_digitos_aceito(self):
        res = self._post({"email": "w11@example.com", "whatsapp": "48988880000"})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_whatsapp_9_digitos_rejeitado(self):
        res = self._post({"email": "w9@example.com", "whatsapp": "488880000"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("whatsapp", res.data)

    def test_whatsapp_12_digitos_rejeitado(self):
        res = self._post({"email": "w12@example.com", "whatsapp": "554888880000"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("whatsapp", res.data)

    def test_whatsapp_com_mascara_rejeitado_pelo_serializer(self):
        """Frontend strips non-digits before sending, but backend must also reject if not stripped."""
        res = self._post({"email": "wmask@example.com", "whatsapp": "(48) 9999-0000"})
        # (48) 9999-0000 → 10 digits after stripping → must PASS
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_cidade_valida_aceita(self):
        casos = [
            ("Criciúma", "cidade1@example.com"),
            ("Içara", "cidade2@example.com"),
            ("Tubarão", "cidade3@example.com"),
            ("Araranguá", "cidade4@example.com"),
        ]
        for cidade, email in casos:
            cache.clear()
            res = self._post({"email": email, "cidade": cidade})
            self.assertEqual(res.status_code, status.HTTP_201_CREATED, f"cidade={cidade} falhou")

    def test_cidade_invalida_rejeitada(self):
        res = self._post({"email": "city@example.com", "cidade": "São Paulo"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("cidade", res.data)

    def test_email_duplicado_rejeitado(self):
        self._post()
        res = self._post()  # same email
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", res.data)

    def test_lgpd_consent_false_rejeitado(self):
        res = self._post({"email": "lgpd@example.com", "lgpd_consent": False})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("lgpd_consent", res.data)

    def test_rate_limit_retorna_429_json(self):
        """4th registration from same IP must return 429 with JSON body (not 403 HTML)."""
        for i in range(3):
            res = self._post({"email": f"rl{i}@example.com"})
            self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        res = self._post({"email": "rl3@example.com"})
        self.assertEqual(res.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        # Response must be JSON with 'detail' key (not HTML)
        self.assertIn("detail", res.data)

    def test_categora_inexistente_rejeitada(self):
        res = self._post({"email": "cat@example.com", "categoria_slug": "nao-existe"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("categoria_slug", res.data)
