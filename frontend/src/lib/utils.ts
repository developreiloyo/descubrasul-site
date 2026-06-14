/**
 * Formata preço em BRL.
 */
export function formatarPreco(valor: string | number | null): string {
  if (valor === null || valor === undefined || valor === "") return "";
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Gera link de WhatsApp com mensagem pré-preenchida.
 */
export function linkWhatsApp(numero: string, mensagem: string): string {
  const limpo = numero.replace(/\D/g, "");
  return `https://wa.me/55${limpo}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Trunca texto em N caracteres sem cortar palavras.
 */
export function truncar(texto: string, max: number): string {
  if (!texto || texto.length <= max) return texto;
  return texto.slice(0, texto.lastIndexOf(" ", max)) + "…";
}
/**
 * Converte URL de media do backend para URL acessível pelo browser.
 * Em dev: http://backend:8000/media/... → /media/...
 * Em prod: usa a URL do R2 diretamente
 */
export function mediaUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.includes("backend:8000")) {
    return url.replace("http://backend:8000", "");
  }
  return url;
}