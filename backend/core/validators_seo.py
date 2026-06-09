"""
Validadores de proteção SEO — Piedra angular do DescubraSul.

Uma penalização do Google por spam afeta o domínio inteiro,
não apenas a página infratora. Estes validadores protegem
o ativo principal da plataforma: a autoridade de descubrasul.com.
"""
import re
from collections import Counter
from django.core.exceptions import ValidationError


# Densidade máxima aceitável de uma única palavra no texto.
# Acima de 4% o Google considera keyword stuffing.
DENSIDADE_MAXIMA = 0.04

# Mínimo de palavras para aplicar análise de densidade
# (textos muito curtos geram falsos positivos)
MINIMO_PALAVRAS_ANALISE = 20

# Palavras ignoradas na análise (stopwords PT-BR comuns)
STOPWORDS = {
    "a", "o", "e", "de", "da", "do", "das", "dos", "em", "um", "uma",
    "para", "com", "no", "na", "nos", "nas", "por", "que", "se", "ao",
    "os", "as", "mais", "como", "seu", "sua", "ou", "tem", "ser", "é",
}

# Frases genéricas que indicam conteúdo de baixo valor (thin content)
FRASES_GENERICAS = [
    "somos uma empresa comprometida",
    "qualidade e excelência",
    "melhor atendimento da região",
    "venha nos conhecer",
    "satisfação garantida",
]


def _tokenizar(texto: str) -> list[str]:
    """Extrai palavras do texto, normalizado e sem pontuação."""
    return re.findall(r"\b[a-záàâãéêíóôõúüç]{3,}\b", texto.lower())


def validar_keyword_stuffing(texto: str, campo: str = "descrição") -> None:
    """
    Levanta ValidationError se alguma palavra exceder a densidade máxima.
    Protege o domínio contra penalização do Google por keyword stuffing.
    """
    if not texto:
        return

    palavras = [p for p in _tokenizar(texto) if p not in STOPWORDS]

    if len(palavras) < MINIMO_PALAVRAS_ANALISE:
        return

    contagem = Counter(palavras)
    palavra_top, freq = contagem.most_common(1)[0]
    densidade = freq / len(palavras)

    if densidade > DENSIDADE_MAXIMA:
        raise ValidationError(
            f"A palavra '{palavra_top}' aparece muitas vezes na {campo} "
            f"({freq} vezes). Textos com repetição excessiva prejudicam "
            f"o posicionamento no Google. Reescreva de forma mais natural."
        )


def validar_conteudo_generico(texto: str, campo: str = "descrição") -> None:
    """
    Alerta sobre frases genéricas que o Google considera thin content.
    """
    if not texto:
        return

    texto_lower = texto.lower()
    for frase in FRASES_GENERICAS:
        if frase in texto_lower:
            raise ValidationError(
                f"A {campo} contém a frase genérica '{frase}'. "
                f"Descreva o que torna o seu negócio único — textos "
                f"genéricos não ajudam você a aparecer no Google."
            )


def validar_seo_title(titulo: str) -> None:
    """seo_title: máximo 60 chars, sem repetição de palavra."""
    if not titulo:
        return
    if len(titulo) > 60:
        raise ValidationError("O título SEO deve ter no máximo 60 caracteres.")
    palavras = _tokenizar(titulo)
    contagem = Counter(palavras)
    if contagem and contagem.most_common(1)[0][1] > 2:
        raise ValidationError(
            "O título SEO repete a mesma palavra mais de duas vezes. "
            "Use um título natural e descritivo."
        )


def validar_texto_seo_completo(texto: str, campo: str = "descrição") -> None:
    """Aplica todas as validações SEO de uma vez."""
    validar_keyword_stuffing(texto, campo)
    validar_conteudo_generico(texto, campo)
