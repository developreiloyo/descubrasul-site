import magic
from django.core.exceptions import ValidationError

TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"]
TAMANHO_MAXIMO = 5 * 1024 * 1024  # 5MB


def validar_imagem(arquivo):
    """
    Camada 4 de seguranca: valida o tipo REAL do arquivo
    (nao apenas a extensao) usando python-magic.
    """
    if arquivo.size > TAMANHO_MAXIMO:
        raise ValidationError("Imagem muito grande. Maximo 5MB.")

    tipo_real = magic.from_buffer(arquivo.read(2048), mime=True)
    arquivo.seek(0)

    if tipo_real not in TIPOS_PERMITIDOS:
        raise ValidationError(
            "Tipo de arquivo nao permitido. Use JPG, PNG ou WebP."
        )

    return arquivo
