from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O e-mail é obrigatório")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.SUPERADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Usuários com conta no sistema.
    Visitantes são anônimos — não criam conta.

    Roles:
      COMERCIANTE → dono de negócio, tem Negocio associado
      ADMIN       → operador da plataforma
      SUPERADMIN  → acesso total
    """

    class Role(models.TextChoices):
        COMERCIANTE = "comerciante", "Comerciante"
        ADMIN       = "admin",       "Admin"
        SUPERADMIN  = "superadmin",  "Super Admin"

    email     = models.EmailField(unique=True)
    nome      = models.CharField(max_length=150, blank=True)
    role      = models.CharField(max_length=20, choices=Role.choices, default=Role.COMERCIANTE)
    is_active = models.BooleanField(default=True)
    is_staff  = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name        = "Usuário"
        verbose_name_plural = "Usuários"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
        ]

    def __str__(self):
        return self.email

    @property
    def is_comerciante(self):
        return self.role == self.Role.COMERCIANTE

    @property
    def is_admin_or_above(self):
        return self.role in [self.Role.ADMIN, self.Role.SUPERADMIN]

    @property
    def plano(self):
        """Atalho para o plano do negócio associado."""
        negocio = getattr(self, "negocio", None)
        return negocio.plano if negocio else None
