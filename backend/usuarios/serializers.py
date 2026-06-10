from django.db import transaction
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ["id", "email", "nome", "role", "criado_em"]
        read_only_fields = ["role", "criado_em"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model  = User
        fields = ["email", "nome", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class CadastroCompletoSerializer(serializers.Serializer):
    """
    Cria User + Negocio em uma unica transacao.
    Fluxo de cadastro do comerciante — plano gratuito, status pendente.
    """
    # Dados do usuario
    email    = serializers.EmailField()
    nome     = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)

    # Dados do negocio
    negocio_nome   = serializers.CharField(max_length=200)
    categoria_slug = serializers.SlugField()
    cidade         = serializers.CharField(max_length=100)
    whatsapp       = serializers.CharField(max_length=20)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este e-mail ja esta cadastrado.")
        return value.lower()

    def validate_categoria_slug(self, value):
        from categorias.models import Categoria
        if not Categoria.objects.filter(slug=value, ativo=True).exists():
            raise serializers.ValidationError("Categoria invalida.")
        return value

    def validate_whatsapp(self, value):
        numero = "".join(c for c in value if c.isdigit())
        if len(numero) < 10 or len(numero) > 13:
            raise serializers.ValidationError("Numero de WhatsApp invalido.")
        return numero

    @transaction.atomic
    def create(self, validated_data):
        from negocios.models import Negocio
        from categorias.models import Categoria

        user = User.objects.create_user(
            email=validated_data["email"],
            nome=validated_data["nome"],
            password=validated_data["password"],
            role=User.Role.COMERCIANTE,
        )

        Negocio.objects.create(
            usuario=user,
            nome=validated_data["negocio_nome"],
            categoria=Categoria.objects.get(slug=validated_data["categoria_slug"]),
            cidade=validated_data["cidade"].strip().lower(),
            whatsapp=validated_data["whatsapp"],
            plano=Negocio.Plano.GRATUITO,
            status=Negocio.Status.PENDENTE,
        )

        return user


class ChangePasswordSerializer(serializers.Serializer):
    password_atual = serializers.CharField(write_only=True)
    password_novo  = serializers.CharField(write_only=True, min_length=8)
