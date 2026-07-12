"""
Tests de aceitação — Password Reset
Spec de referência: specs/04-password-reset.md

Estes tests cobrem todos os critérios de aceitação do spec, incluindo
segurança, fluxo feliz e edge cases.

NOTA DE AMBIENTE: o container de desenvolvimento não tem argon2-cffi instalado
apesar de constar em requirements.txt. Todos os tests que criam usuários
devem usar @override_settings com PBKDF2PasswordHasher. Isso é um bug de
ambiente separado reportado na seção final.

Para rodar apenas estes tests:
    cd backend/
    python manage.py test usuarios.tests.test_password_reset --settings=core.settings.dev --keepdb

IMPORTANTE: criar este diretório tests/ torna o arquivo usuarios/tests.py
inacessível via import (o pacote tests/ tem precedência sobre o módulo tests.py
no sistema de imports do Python). O time deve renomear tests.py para
tests/test_isolation.py para que ambos coexistam.
"""

from datetime import datetime, timedelta
from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APIClient

from usuarios.models import User
from usuarios.tokens import password_reset_token_generator


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

PBKDF2_ONLY = {
    "PASSWORD_HASHERS": ["django.contrib.auth.hashers.PBKDF2PasswordHasher"]
}
LOCMEM_CACHE = {
    "CACHES": {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        }
    }
}
LOCMEM_EMAIL = {
    "EMAIL_BACKEND": "django.core.mail.backends.locmem.EmailBackend"
}

COMMON_OVERRIDES = {**PBKDF2_ONLY, **LOCMEM_CACHE, **LOCMEM_EMAIL}

URL_REQUEST = "/api/usuarios/password-reset/"
URL_CONFIRM = "/api/usuarios/password-reset/confirm/"


def criar_usuario(email: str, password: str = "Senha@1234") -> User:
    return User.objects.create_user(email=email, password=password)


def gerar_uid_token(user: User):
    """Retorna (uid, token) válidos para o usuário usando o generator customizado."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = password_reset_token_generator.make_token(user)
    return uid, token


# ---------------------------------------------------------------------------
# Flujo feliz
# ---------------------------------------------------------------------------

@override_settings(**COMMON_OVERRIDES)
class TestPasswordResetRequestFluxoFeliz(TestCase):
    """POST /api/usuarios/password-reset/ — email cadastrado."""

    def setUp(self):
        # LocMemCache usa dicionários de nível de módulo que persistem entre tests.
        # cache.clear() garante que contadores de rate limit não contaminem o suite.
        cache.clear()
        self.client = APIClient()
        self.user = criar_usuario("merchant@example.com")

    def test_email_registrado_retorna_200(self):
        """
        Spec: "Um merchant pode solicitar reset desde login sem ajuda manual."
        Endpoint deve responder 200 independentemente de o e-mail existir.
        """
        response = self.client.post(URL_REQUEST, {"email": "merchant@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_resposta_contem_ok_true(self):
        """
        Spec: resposta genérica que não revela informações.
        O corpo deve ser { "ok": true }.
        """
        response = self.client.post(URL_REQUEST, {"email": "merchant@example.com"}, format="json")
        self.assertIn("ok", response.data)
        self.assertTrue(response.data["ok"])

    def test_email_registrado_envia_email(self):
        """
        Spec: "Sistema envia e-mail com link de reset."
        Quando o e-mail existe, exatamente um e-mail deve ser enviado.
        """
        from django.core import mail
        response = self.client.post(URL_REQUEST, {"email": "merchant@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

    def test_email_enviado_contem_link_com_uid_e_token(self):
        """
        Spec: "Link contiene un token de un solo uso."
        O link enviado deve conter uid= e token= como parâmetros.
        """
        from django.core import mail
        self.client.post(URL_REQUEST, {"email": "merchant@example.com"}, format="json")
        self.assertEqual(len(mail.outbox), 1)
        corpo = mail.outbox[0].body
        self.assertIn("uid=", corpo)
        self.assertIn("token=", corpo)

    def test_email_enviado_para_destinatario_correto(self):
        """O e-mail de reset deve ser endereçado ao usuário solicitante."""
        from django.core import mail
        self.client.post(URL_REQUEST, {"email": "merchant@example.com"}, format="json")
        self.assertIn("merchant@example.com", mail.outbox[0].to)


@override_settings(**COMMON_OVERRIDES)
class TestPasswordResetConfirmFluxoFeliz(TestCase):
    """POST /api/usuarios/password-reset/confirm/ — token válido."""

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = criar_usuario("merchant@example.com")
        self.uid, self.token = gerar_uid_token(self.user)
        self.nova_senha = "NovaSenhaSegura@2026"

    def test_confirm_com_token_valido_retorna_200(self):
        """
        Spec: "El link recibido funciona una sola vez y expira automáticamente."
        Primeira utilização com token válido deve retornar 200.
        """
        response = self.client.post(URL_CONFIRM, {
            "uid": self.uid,
            "token": self.token,
            "password": self.nova_senha,
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_confirm_atualiza_senha_no_banco(self):
        """Spec: "Merchant define nueva contraseña."
        A senha no banco deve ser diferente da anterior após reset.
        """
        senha_antes = self.user.password  # hash antes do reset
        self.client.post(URL_CONFIRM, {
            "uid": self.uid,
            "token": self.token,
            "password": self.nova_senha,
        }, format="json")
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.password, senha_antes)

    def test_merchant_pode_logar_com_nova_senha(self):
        """
        Spec: "Merchant define nueva contraseña [...] se le redirige a login."
        Após reset, o merchant deve conseguir autenticar com a nova senha.
        """
        self.client.post(URL_CONFIRM, {
            "uid": self.uid,
            "token": self.token,
            "password": self.nova_senha,
        }, format="json")
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.nova_senha))

    def test_merchant_nao_pode_logar_com_senha_antiga(self):
        """Após reset, a senha anterior deve ser inválida."""
        self.client.post(URL_CONFIRM, {
            "uid": self.uid,
            "token": self.token,
            "password": self.nova_senha,
        }, format="json")
        self.user.refresh_from_db()
        self.assertFalse(self.user.check_password("Senha@1234"))


# ---------------------------------------------------------------------------
# Segurança — não revelar existência do e-mail
# ---------------------------------------------------------------------------

@override_settings(**COMMON_OVERRIDES)
class TestPasswordResetNaoRevelaEmail(TestCase):
    """
    Spec: "El endpoint de solicitud no permite determinar si un email
    está registrado o no, por la respuesta que devuelve."
    """

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        criar_usuario("existe@example.com")

    def test_email_nao_registrado_retorna_200(self):
        """
        Spec: Resposta genérica mesmo para e-mails não cadastrados.
        Se retornasse 404, um atacante poderia enumerar contas existentes.
        """
        response = self.client.post(URL_REQUEST, {"email": "naoexiste@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_email_nao_registrado_retorna_mesmo_corpo_que_registrado(self):
        """
        Spec: A resposta não deve diferenciar entre e-mails existentes e inexistentes.
        """
        res_existe = self.client.post(URL_REQUEST, {"email": "existe@example.com"}, format="json")
        res_nao_existe = self.client.post(URL_REQUEST, {"email": "naoexiste@example.com"}, format="json")
        self.assertEqual(res_existe.status_code, res_nao_existe.status_code)
        self.assertEqual(res_existe.data, res_nao_existe.data)

    def test_email_nao_registrado_nao_envia_email(self):
        """
        Segurança: Para e-mails não cadastrados, nenhum e-mail deve ser enviado.
        A resposta é a mesma, mas internamente não há envio.
        """
        from django.core import mail
        self.client.post(URL_REQUEST, {"email": "naoexiste@example.com"}, format="json")
        self.assertEqual(len(mail.outbox), 0)


# ---------------------------------------------------------------------------
# Segurança — token de uso único (consumido)
# ---------------------------------------------------------------------------

@override_settings(**COMMON_OVERRIDES)
class TestPasswordResetTokenUsoUnico(TestCase):
    """
    Spec: "El link recibido funciona una sola vez."
    Spec: "Intentar reusar un link ya consumido [...] muestra un error claro."
    """

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = criar_usuario("merchant@example.com")
        self.uid, self.token = gerar_uid_token(self.user)

    def test_reuso_de_token_consumido_retorna_erro(self):
        """
        Spec: "Intentar reusar un link ya consumido [...] muestra un error claro,
        no un fallo silencioso."
        Após uso bem-sucedido, reuso do mesmo token deve retornar 400.
        """
        # Primeiro uso — deve funcionar
        primeiro = self.client.post(URL_CONFIRM, {
            "uid": self.uid,
            "token": self.token,
            "password": "NovaSenha@2026",
        }, format="json")
        self.assertEqual(primeiro.status_code, status.HTTP_200_OK)

        # Segundo uso — token deve estar inválido (senha mudou, hash mudou)
        segundo = self.client.post(URL_CONFIRM, {
            "uid": self.uid,
            "token": self.token,
            "password": "OutraSenha@2026",
        }, format="json")
        self.assertIn(segundo.status_code, [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_410_GONE,
        ], msg="Reuso de token consumido deve retornar 400 ou 410, não 200.")

    def test_reuso_de_token_consumido_nao_altera_senha(self):
        """
        Após consumir o token, tentativa de reuso não deve alterar a senha
        definida no primeiro reset.
        """
        self.client.post(URL_CONFIRM, {
            "uid": self.uid,
            "token": self.token,
            "password": "PrimeiraNovaSenha@2026",
        }, format="json")
        self.user.refresh_from_db()
        hash_apos_primeiro_reset = self.user.password

        self.client.post(URL_CONFIRM, {
            "uid": self.uid,
            "token": self.token,
            "password": "SegundaTentativa@2026",
        }, format="json")
        self.user.refresh_from_db()
        self.assertEqual(
            self.user.password,
            hash_apos_primeiro_reset,
            "Reuso de token consumido não deve alterar a senha.",
        )

    def test_reuso_retorna_mensagem_de_erro_clara(self):
        """
        Spec: "muestra un error claro" — a resposta de erro deve conter
        uma mensagem explícita (campo 'detail' ou similar), não estar vazia.
        """
        self.client.post(URL_CONFIRM, {
            "uid": self.uid,
            "token": self.token,
            "password": "NovaSenha@2026",
        }, format="json")
        segundo = self.client.post(URL_CONFIRM, {
            "uid": self.uid,
            "token": self.token,
            "password": "OutraSenha@2026",
        }, format="json")
        self.assertTrue(
            len(segundo.data) > 0,
            "Resposta de erro após reuso deve conter pelo menos um campo de mensagem.",
        )


# ---------------------------------------------------------------------------
# Segurança — token expirado
# ---------------------------------------------------------------------------

@override_settings(**COMMON_OVERRIDES)
class TestPasswordResetTokenExpirado(TestCase):
    """
    Spec: "El link contiene un token de un solo uso, con expiración."
    Spec: "Intentar reusar un link [...] expirado muestra un error claro."

    A implementação usa DescubraSulPasswordResetTokenGenerator com
    PASSWORD_RESET_TIMEOUT = 3600 (1 hora) configurado em base.py.
    Os patches de `_now` devem apontar para `password_reset_token_generator`
    (não para `default_token_generator`) pois é esse generator que a view usa.
    """

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = criar_usuario("merchant@example.com")

    def test_token_expirado_retorna_erro(self):
        """
        Spec: "Intentar reusar un link [...] expirado muestra un error claro."
        Simula expiração avançando o relógio além do timeout configurado.
        """
        uid, token = gerar_uid_token(self.user)

        # Avança o tempo além do PASSWORD_RESET_TIMEOUT (padrão: 3 dias = 259200s)
        future = datetime.now() + timedelta(seconds=259201)
        with patch.object(password_reset_token_generator, "_now", return_value=future):
            response = self.client.post(URL_CONFIRM, {
                "uid": uid,
                "token": token,
                "password": "NovaSenha@2026",
            }, format="json")

        self.assertIn(response.status_code, [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_410_GONE,
        ], msg="Token expirado deve retornar 400 ou 410.")

    def test_token_expirado_nao_altera_senha(self):
        """Token expirado não deve atualizar a senha no banco."""
        uid, token = gerar_uid_token(self.user)
        hash_original = self.user.password

        future = datetime.now() + timedelta(seconds=259201)
        with patch.object(password_reset_token_generator, "_now", return_value=future):
            self.client.post(URL_CONFIRM, {
                "uid": uid,
                "token": token,
                "password": "NovaSenha@2026",
            }, format="json")

        self.user.refresh_from_db()
        self.assertEqual(self.user.password, hash_original)

    @override_settings(PASSWORD_RESET_TIMEOUT=3600)
    def test_token_expira_em_1_hora(self):
        """
        Spec: "Expiración corta — recomendado 1 hora."

        PASSWORD_RESET_TIMEOUT = 3600 está agora em base.py.
        Token gerado agora deve ser rejeitado quando verificado 61 minutos depois.
        O patch deve apontar para password_reset_token_generator, que é o generator
        usado pela PasswordResetConfirmView.
        """
        uid, token = gerar_uid_token(self.user)

        # Token gerado agora, verificado daqui a 61 minutos
        future_61min = datetime.now() + timedelta(minutes=61)
        with patch.object(password_reset_token_generator, "_now", return_value=future_61min):
            response = self.client.post(URL_CONFIRM, {
                "uid": uid,
                "token": token,
                "password": "NovaSenha@2026",
            }, format="json")

        self.assertIn(response.status_code, [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_410_GONE,
        ], msg=(
            "Com PASSWORD_RESET_TIMEOUT=3600 (1h), token de 61 minutos deve expirar."
        ))


# ---------------------------------------------------------------------------
# Segurança — token inválido / malformado
# ---------------------------------------------------------------------------

@override_settings(**COMMON_OVERRIDES)
class TestPasswordResetTokenInvalido(TestCase):
    """
    Spec: "Intentar reusar un link ya consumido o expirado muestra un error claro."
    """

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = criar_usuario("merchant@example.com")
        self.uid, _ = gerar_uid_token(self.user)

    def test_token_completamente_invalido_retorna_400(self):
        """Token aleatório/forjado deve ser rejeitado com 400."""
        response = self.client.post(URL_CONFIRM, {
            "uid": self.uid,
            "token": "token-completamente-invalido-abc123",
            "password": "NovaSenha@2026",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_uid_invalido_retorna_400(self):
        """UID malformado deve ser rejeitado com 400."""
        response = self.client.post(URL_CONFIRM, {
            "uid": "uid-invalido",
            "token": "token-qualquer",
            "password": "NovaSenha@2026",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_uid_de_usuario_inexistente_retorna_400(self):
        """UID válido em formato mas para PK que não existe deve retornar 400."""
        uid_inexistente = urlsafe_base64_encode(force_bytes(99999999))
        response = self.client.post(URL_CONFIRM, {
            "uid": uid_inexistente,
            "token": "qualquer-token",
            "password": "NovaSenha@2026",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_token_de_outro_usuario_nao_funciona_para_este_uid(self):
        """
        Segurança: token válido gerado para user_a não deve funcionar para user_b.
        Evita ataques de token cross-user.
        """
        user_b = criar_usuario("outro@example.com")
        uid_b, token_b = gerar_uid_token(user_b)
        uid_a, _ = gerar_uid_token(self.user)

        # Tenta usar token do user_b com uid do user_a
        response = self.client.post(URL_CONFIRM, {
            "uid": uid_a,
            "token": token_b,
            "password": "NovaSenha@2026",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_campos_ausentes_retorna_400(self):
        """Payload incompleto deve retornar 400 de validação."""
        response = self.client.post(URL_CONFIRM, {
            "uid": self.uid,
            # token e password ausentes
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_payload_vazio_retorna_400(self):
        """Payload completamente vazio deve retornar 400."""
        response = self.client.post(URL_CONFIRM, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Segurança — token anterior invalidado ao gerar novo
# ---------------------------------------------------------------------------

@override_settings(**COMMON_OVERRIDES)
class TestPasswordResetInvalidaTokenAnterior(TestCase):
    """
    Spec: "Invalidar tokens anteriores del mismo usuario cuando se genera
    uno nuevo (evita que un link viejo filtrado siga siendo válido)."

    Implementação: campo reset_token_version no modelo User é incrementado
    cada vez que um novo token é gerado. Como o valor faz parte do hash HMAC
    do token (via DescubraSulPasswordResetTokenGenerator._make_hash_value),
    tokens gerados com versão anterior tornam-se automaticamente inválidos.
    """

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = criar_usuario("merchant@example.com")

    def test_novo_token_invalida_token_anterior(self):
        """
        Spec: "Invalidar todos los tokens de reset previos de un usuario
        cuando genera uno nuevo."

        Fluxo:
        1. token_1 gerado com reset_token_version=0.
        2. Novo request via URL_REQUEST → versão incrementada para 1 no banco.
        3. Tentativa de usar token_1 → check_token recalcula o hash com versão=1
           do banco, mas token_1 foi gerado com versão=0 → hashes diferentes → 400.
        """
        # Gera primeiro token
        uid_1, token_1 = gerar_uid_token(self.user)

        # Merchant solicita novo reset (gera segundo token)
        self.client.post(URL_REQUEST, {"email": self.user.email}, format="json")
        uid_2, token_2 = gerar_uid_token(self.user)

        # O primeiro token NÃO deveria mais ser válido após a geração do segundo
        # Este teste documenta o requisito — atualmente FALHA porque o Django
        # não invalida tokens anteriores automaticamente
        response_token_1 = self.client.post(URL_CONFIRM, {
            "uid": uid_1,
            "token": token_1,
            "password": "NovaSenha@2026",
        }, format="json")

        self.assertIn(response_token_1.status_code, [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_410_GONE,
        ], msg=(
            "Token anterior deve ser invalidado quando novo token é gerado. "
            "Implementação atual falha aqui — default_token_generator do Django "
            "não invalida tokens anteriores. Requer estratégia dedicada."
        ))


# ---------------------------------------------------------------------------
# Segurança — Rate Limiting
# ---------------------------------------------------------------------------

@override_settings(**COMMON_OVERRIDES)
class TestPasswordResetRateLimit(TestCase):
    """
    Spec: "Rate limiting en el endpoint de solicitud de reset — evitar que
    alguien spamee de emails a un merchant."
    CLAUDE.md: password_reset: 5/hour

    A view usa PasswordResetThrottle (throttle_classes = [PasswordResetThrottle])
    em vez de django-ratelimit. O DRF retorna 429 Too Many Requests corretamente.
    """

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        criar_usuario("merchant@example.com")

    def test_rate_limit_apos_n_requests(self):
        """
        Spec: Rate limiting no endpoint de solicitude.
        Após exceder o limite (5/hora), a view retorna 429 Too Many Requests
        via PasswordResetThrottle (throttle_classes do DRF).
        """
        for _ in range(5):
            self.client.post(URL_REQUEST, {"email": "merchant@example.com"}, format="json")

        # 6ª requisição deve ser bloqueada
        response = self.client.post(URL_REQUEST, {"email": "merchant@example.com"}, format="json")
        self.assertEqual(
            response.status_code,
            status.HTTP_429_TOO_MANY_REQUESTS,
            msg=(
                f"Esperado 429 (Too Many Requests) após exceder rate limit. "
                f"Recebido: {response.status_code}. "
                f"A view usa django-ratelimit (retorna 403) em vez de "
                f"PasswordResetThrottle do DRF (retornaria 429)."
            ),
        )

    def test_rate_limit_nao_afeta_endpoint_de_confirmacao(self):
        """
        O rate limit de 5/hora se aplica apenas ao endpoint de SOLICITAÇÃO.
        O endpoint de CONFIRMAÇÃO não deve ter o mesmo rate limit aplicado
        na mesma sessão — um merchant com token válido deve poder confirmar.

        Fluxo:
        1. Envia 5 requests (todos dentro do limite) → reset_token_version sobe para 5.
        2. Gera uid+token com a versão atual do usuário (versão 5).
        3. Envia o 6º request → bloqueado (429), versão NÃO incrementa.
        4. Usa o token gerado no passo 2 no endpoint de confirmação → deve retornar 200,
           pois o rate limit do endpoint de solicitação não afeta o de confirmação.
        """
        # Passo 1: satura os 5 slots disponíveis
        for _ in range(5):
            self.client.post(URL_REQUEST, {"email": "merchant@example.com"}, format="json")

        # Passo 2: relê o usuário do banco para obter o reset_token_version atualizado
        # e gera o token com esse valor correto.
        user = User.objects.get(email="merchant@example.com")
        uid, token = gerar_uid_token(user)

        # Passo 3: 6ª requisição é bloqueada; reset_token_version NÃO é incrementado
        # porque a view nunca chega a executar (throttle rejeita antes).
        self.client.post(URL_REQUEST, {"email": "merchant@example.com"}, format="json")

        # Passo 4: o endpoint de confirmação deve aceitar o token
        response = self.client.post(URL_CONFIRM, {
            "uid": uid,
            "token": token,
            "password": "NovaSenha@2026",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------------

@override_settings(**COMMON_OVERRIDES)
class TestPasswordResetEdgeCases(TestCase):
    """Casos extremos não cobertos pelos tests principais."""

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = criar_usuario("merchant@example.com")

    def test_email_maiusculas_normalizado(self):
        """
        Edge case: e-mail enviado em maiúsculas deve ser normalizado para
        encontrar o usuário correspondente (armazenado em minúsculas).
        """
        from django.core import mail
        response = self.client.post(URL_REQUEST, {"email": "MERCHANT@EXAMPLE.COM"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Usuário deve ser encontrado e e-mail enviado
        self.assertEqual(len(mail.outbox), 1)

    def test_email_com_espacos_strip_e_processado(self):
        """
        Edge case: DRF's CharField (base de EmailField) tem trim_whitespace=True.
        Leading/trailing spaces são removidos ANTES da validação de formato.
        " merchant@example.com " → strip → "merchant@example.com" → válido → 200.

        Nota: se a premissa fosse que o backend devesse REJEITAR espaços (400),
        seria necessário um validate_email personalizado. A decisão atual (strip) é
        razoável do ponto de vista de UX.
        """
        from django.core import mail
        response = self.client.post(URL_REQUEST, {"email": " merchant@example.com "}, format="json")
        # DRF strips whitespace → email é normalizado → usuário encontrado → 200
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # O usuário é encontrado e o e-mail enviado normalmente
        self.assertEqual(len(mail.outbox), 1)

    def test_senha_nova_identica_a_anterior_permitida(self):
        """
        Edge case: O spec não proíbe definir a mesma senha no reset.
        DECISÃO: Permitido — o fluxo de reset é para recuperar acesso,
        não para forçar troca. Não há validação de "senha igual à anterior".
        Se essa decisão mudar, o test deve ser atualizado.
        """
        uid, token = gerar_uid_token(self.user)
        response = self.client.post(URL_CONFIRM, {
            "uid": uid,
            "token": token,
            "password": "Senha@1234",  # mesma senha original
        }, format="json")
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Definir a mesma senha no reset deve ser permitido (ver comentário no test).",
        )

    def test_senha_nova_muito_curta_retorna_400(self):
        """
        Edge case: A nova senha deve respeitar o min_length=8 definido
        no PasswordResetConfirmSerializer.
        """
        uid, token = gerar_uid_token(self.user)
        response = self.client.post(URL_CONFIRM, {
            "uid": uid,
            "token": token,
            "password": "curta",  # menos de 8 caracteres
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_senha_nova_vazia_retorna_400(self):
        """Edge case: senha vazia deve ser rejeitada."""
        uid, token = gerar_uid_token(self.user)
        response = self.client.post(URL_CONFIRM, {
            "uid": uid,
            "token": token,
            "password": "",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_request_sem_campo_email_retorna_400(self):
        """Payload sem campo email deve retornar 400 de validação."""
        response = self.client.post(URL_REQUEST, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_request_com_email_invalido_retorna_400(self):
        """E-mail malformado deve retornar 400 de validação."""
        response = self.client.post(URL_REQUEST, {"email": "nao-e-um-email"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_usuario_inativo_nao_consegue_usar_token(self):
        """
        Edge case de segurança: usuários inativos (is_active=False)
        não devem conseguir redefinir senha com sucesso.
        Django's default_token_generator.check_token() retorna False
        para usuários inativos.
        """
        uid, token = gerar_uid_token(self.user)
        self.user.is_active = False
        self.user.save(update_fields=["is_active"])

        response = self.client.post(URL_CONFIRM, {
            "uid": uid,
            "token": token,
            "password": "NovaSenha@2026",
        }, format="json")
        self.assertIn(response.status_code, [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_410_GONE,
        ])

    def test_metodo_get_no_endpoint_request_nao_e_permitido(self):
        """O endpoint de solicitação só aceita POST."""
        response = self.client.get(URL_REQUEST)
        self.assertIn(response.status_code, [
            status.HTTP_405_METHOD_NOT_ALLOWED,
            status.HTTP_401_UNAUTHORIZED,
        ])

    def test_metodo_get_no_endpoint_confirm_nao_e_permitido(self):
        """O endpoint de confirmação só aceita POST."""
        response = self.client.get(URL_CONFIRM)
        self.assertIn(response.status_code, [
            status.HTTP_405_METHOD_NOT_ALLOWED,
            status.HTTP_401_UNAUTHORIZED,
        ])
