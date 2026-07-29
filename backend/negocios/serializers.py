from rest_framework import serializers
from .models import Negocio, Produto, Localizacao, RedesSociais, VideoDestaque, FotoProduto, FotoNegocio, PLANO_CONFIG
from .validators import validar_imagem
from categorias.serializers import CategoriaSerializer
from categorias.models import Categoria
from core.validators_seo import validar_texto_seo_completo, validar_seo_title
from core.constants import CIDADES_NOMES

DIAS_VALIDOS = {"seg", "ter", "qua", "qui", "sex", "sab", "dom"}


class RedesSociaisSerializer(serializers.ModelSerializer):
    class Meta:
        model  = RedesSociais
        fields = ["instagram_url", "tiktok_url", "facebook_url", "youtube_url", "linkedin_url"]


class RedesSociaisPainelSerializer(serializers.ModelSerializer):
    class Meta:
        model  = RedesSociais
        fields = ["instagram_url", "tiktok_url", "facebook_url", "youtube_url", "linkedin_url"]
        extra_kwargs = {
            "instagram_url": {"required": False, "allow_blank": True},
            "tiktok_url":    {"required": False, "allow_blank": True},
            "facebook_url":  {"required": False, "allow_blank": True},
            "youtube_url":   {"required": False, "allow_blank": True},
            "linkedin_url":  {"required": False, "allow_blank": True},
        }


class LocalizacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Localizacao
        fields = ["logradouro", "numero", "direccao_fmt", "lat", "lng", "cidade", "bairro", "area_servico", "cep"]


class LocalizacaoPainelSerializer(serializers.ModelSerializer):
    logradouro = serializers.CharField(required=False, allow_blank=True, max_length=200)
    numero     = serializers.CharField(required=False, allow_blank=True, max_length=20)

    class Meta:
        model  = Localizacao
        fields = ["logradouro", "numero", "cep", "bairro", "cidade", "estado"]
        extra_kwargs = {
            "cep":    {"required": False, "allow_blank": True},
            "bairro": {"required": False, "allow_blank": True},
            "cidade": {"required": False, "allow_blank": True},
            "estado": {"required": False, "allow_blank": True},
        }


class VideoDestaqueSerializer(serializers.ModelSerializer):
    class Meta:
        model  = VideoDestaque
        fields = ["plataforma", "oembed_html", "criado_em"]


class FotoProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FotoProduto
        fields = ["id", "foto", "alt_texto", "ordem"]


class FotoNegocioSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FotoNegocio
        fields = ["id", "foto", "alt_texto", "ordem", "criado_em"]
        read_only_fields = ["id", "criado_em"]


# ─── Serializer publico (visitante) ───────────────────────────────────
class NegocioPublicoSerializer(serializers.ModelSerializer):
    categoria       = CategoriaSerializer(read_only=True)
    redes_sociais   = RedesSociaisSerializer(read_only=True)
    localizacao     = LocalizacaoSerializer(read_only=True)
    videos          = VideoDestaqueSerializer(many=True, read_only=True)
    seo_title       = serializers.SerializerMethodField()
    seo_description = serializers.SerializerMethodField()

    class Meta:
        model  = Negocio
        fields = [
            "slug", "nome", "descricao", "historia", "logo", "alt_logo",
            "categoria", "categoria_tipo", "cidade", "bairro",
            "whatsapp", "website",
            "telefone", "email_contato", "nome_responsavel",
            "verificado", "plano",
            "horario_abertura", "horario_fechamento", "dias_funcionamento",
            "atualizado_em",
            "seo_title", "seo_description", "og_image", "palavras_chave",
            "google_place_id",
            "redes_sociais", "localizacao", "videos", "espaco_especial",
        ]

    def get_seo_title(self, obj):
        return obj.get_seo_title()

    def get_seo_description(self, obj):
        return obj.get_seo_description()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        cfg = PLANO_CONFIG.get(instance.plano, PLANO_CONFIG["gratuito"])
        if not cfg["permite_historia"]:
            data["historia"] = ""
        if not cfg["permite_website"]:
            data["website"] = ""
        if not cfg["permite_email_contato"]:
            data["email_contato"] = ""
        if not cfg["permite_redes_sociais"]:
            data["redes_sociais"] = None
        return data


# ─── Serializer do painel (comerciante) ───────────────────────────────
class NegocioPainelSerializer(serializers.ModelSerializer):
    localizacao    = LocalizacaoPainelSerializer(required=False)
    redes_sociais  = RedesSociaisPainelSerializer(required=False)
    categoria      = CategoriaSerializer(read_only=True)
    categoria_slug = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Categoria.objects.filter(ativo=True),
        source="categoria",
        required=False,
        write_only=True,
    )

    class Meta:
        model  = Negocio
        fields = [
            "slug", "nome", "descricao", "historia", "logo", "alt_logo",
            "categoria", "categoria_slug", "cidade", "bairro", "whatsapp", "website",
            "telefone", "email_contato", "nome_responsavel",
            "plano", "status", "verificado",
            "seo_title", "seo_description", "og_image", "palavras_chave",
            "horario_abertura", "horario_fechamento", "dias_funcionamento",
            "google_place_id",
            "criado_em", "atualizado_em",
            "localizacao", "redes_sociais", "espaco_especial",
        ]
        read_only_fields = ["slug", "plano", "status", "verificado", "bairro",
                            "criado_em", "atualizado_em"]
        extra_kwargs = {
            "telefone":         {"required": False, "allow_blank": True},
            "email_contato":    {"required": False, "allow_blank": True},
            "nome_responsavel": {"required": False, "allow_blank": True},
            "website":          {"required": False, "allow_blank": True},
        }

    def validate_descricao(self, value):
        validar_texto_seo_completo(value, campo="descricao do negocio")
        return value

    def validate_historia(self, value):
        if value:
            validar_texto_seo_completo(value, campo="historia do negocio")
        return value

    def validate_seo_title(self, value):
        validar_seo_title(value)
        return value

    def validate_seo_description(self, value):
        validar_texto_seo_completo(value, campo="descricao SEO")
        return value

    def validate_cidade(self, value):
        if not value:
            return value
        from negocios.models import normalizar_cidade
        from core.constants import CIDADES_ATENDIDAS
        normalized_input = normalizar_cidade(value.strip())
        for _, nome in CIDADES_ATENDIDAS:
            if normalizar_cidade(nome) == normalized_input:
                return nome  # retorna forma canônica com acentos
        raise serializers.ValidationError(
            "Cidade não atendida pelo DescubraSul. "
            f"Cidades aceitas: {', '.join(CIDADES_NOMES)}."
        )

    def validate_whatsapp(self, value):
        digits = "".join(c for c in (value or "") if c.isdigit())
        # Remove código do país 55 se presente (ex: +55 48 99999-0000 → 13 dígitos → 11)
        if len(digits) == 13 and digits.startswith("55"):
            digits = digits[2:]
        if len(digits) == 12 and digits.startswith("55"):
            digits = digits[2:]
        if len(digits) < 10:
            raise serializers.ValidationError(
                "WhatsApp inválido — informe DDD + número (mínimo 10 dígitos)."
            )
        if len(digits) > 11:
            raise serializers.ValidationError(
                "WhatsApp inválido — máximo 11 dígitos (com DDD)."
            )
        return digits

    def validate_telefone(self, value):
        if not value:
            return value
        digits = "".join(c for c in value if c.isdigit())
        if len(digits) == 13 and digits.startswith("55"):
            digits = digits[2:]
        if len(digits) == 12 and digits.startswith("55"):
            digits = digits[2:]
        if digits and (len(digits) < 10 or len(digits) > 11):
            raise serializers.ValidationError(
                "Telefone inválido — informe DDD + número (10 ou 11 dígitos)."
            )
        return digits

    def validate_dias_funcionamento(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("dias_funcionamento deve ser uma lista.")
        invalidos = [d for d in value if d not in DIAS_VALIDOS]
        if invalidos:
            raise serializers.ValidationError(
                f"Dias inválidos: {invalidos}. Use: {sorted(DIAS_VALIDOS)}."
            )
        return value

    def validate_espaco_especial(self, value):
        if value is None:
            return value
        TIPOS_VALIDOS = {"texto", "oferta", "cupom", "banner", "video"}
        if value.get("tipo") not in TIPOS_VALIDOS:
            raise serializers.ValidationError("Tipo de espaço especial inválido.")
        cta_link = value.get("cta_link", "")
        if cta_link and not cta_link.startswith(("https://", "http://")):
            raise serializers.ValidationError(
                "cta_link deve ser uma URL http ou https válida."
            )
        for campo in ("titulo", "conteudo"):
            valor = value.get(campo, "")
            if valor:
                validar_texto_seo_completo(valor, campo)
        return value

    def update(self, instance, validated_data):
        loc_data   = validated_data.pop("localizacao", None)
        redes_data = validated_data.pop("redes_sociais", None)

        # bairro is read-only at the Negocio level — kept in sync by signal
        validated_data.pop("bairro", None)

        instance = super().update(instance, validated_data)

        if loc_data and any(v for v in loc_data.values()):
            Localizacao.objects.update_or_create(
                negocio=instance,
                defaults=loc_data,
            )

        if redes_data is not None:
            RedesSociais.objects.update_or_create(
                negocio=instance,
                defaults=redes_data,
            )
        return instance


# ─── Produto publico ──────────────────────────────────────────────────
class ProdutoPublicoSerializer(serializers.ModelSerializer):
    negocio = serializers.SerializerMethodField()
    fotos   = serializers.SerializerMethodField()

    class Meta:
        model  = Produto
        fields = [
            "slug", "nome", "foto", "alt_foto", "descricao",
            "descricao_longa", "categoria", "tipo_produto", "preco", "disponivel",
            "video_youtube_url", "atualizado_em", "negocio", "fotos",
        ]

    def get_negocio(self, obj):
        return {
            "slug":           obj.negocio.slug,
            "nome":           obj.negocio.nome,
            "cidade":         obj.negocio.cidade,
            "categoria":      str(obj.negocio.categoria),
            "categoria_slug": obj.negocio.categoria.slug,
            "whatsapp":       obj.negocio.whatsapp,
        }

    def get_fotos(self, obj):
        limite = PLANO_CONFIG.get(obj.negocio.plano, PLANO_CONFIG["gratuito"])["fotos_por_produto"]
        fotos = obj.fotos.all()[:limite]
        return FotoProdutoSerializer(fotos, many=True, context=self.context).data


# ─── Produto painel (comerciante) ─────────────────────────────────────
class ProdutoPainelSerializer(serializers.ModelSerializer):
    fotos = FotoProdutoSerializer(many=True, read_only=True)

    class Meta:
        model  = Produto
        fields = [
            "id", "slug", "nome", "foto", "alt_foto", "descricao",
            "descricao_longa", "categoria", "tipo_produto", "preco", "disponivel",
            "video_youtube_url", "confirmado_em", "criado_em", "atualizado_em", "fotos",
        ]
        read_only_fields = ["slug", "criado_em", "atualizado_em"]

    def validate_foto(self, value):
        if value:
            validar_imagem(value)
        return value

    def validate_descricao(self, value):
        validar_texto_seo_completo(value, campo="descricao do produto")
        return value

    def validate_tipo_produto(self, value):
        if value:
            validar_texto_seo_completo(value, campo="tipo do produto")
        return value

    def validate_video_youtube_url(self, value):
        if not value:
            return value
        import re
        pattern = r'^https?://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[\w-]{11}'
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "URL inválida. Use youtube.com/watch?v=ID ou youtu.be/ID."
            )
        return value

    def validate(self, data):
        request = self.context.get("request")
        if request and data.get("video_youtube_url"):
            negocio = request.user.negocio
            if not negocio.permite_video:
                raise serializers.ValidationError(
                    {"video_youtube_url": "Vídeos disponíveis apenas no Plano Destaque Sul."}
                )
        return data