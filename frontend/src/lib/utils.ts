import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
function normalizeDia(s: string): string {
  return s.replace(".", "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Verifica se o negócio está aberto agora (horário de Brasília).
 * Considera dias_funcionamento quando informado.
 */
export function isAberto(
  abertura: string | null,
  fechamento: string | null,
  dias: string[] = []
): boolean {
  if (!abertura || !fechamento) return false;

  const agora = new Date();

  if (dias.length > 0) {
    const diaFmt = new Intl.DateTimeFormat("pt-BR", {
      weekday: "short",
      timeZone: "America/Sao_Paulo",
    }).format(agora);
    if (!dias.includes(normalizeDia(diaFmt))) return false;
  }

  const partes = new Intl.DateTimeFormat("pt-BR", {
    hour: "numeric", minute: "numeric", hour12: false,
    timeZone: "America/Sao_Paulo",
  }).formatToParts(agora);

  const h = Number(partes.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(partes.find((p) => p.type === "minute")?.value ?? 0);
  const [hA, mA] = abertura.split(":").map(Number);
  const [hF, mF] = fechamento.split(":").map(Number);
  const atual = h * 60 + m;
  return atual >= hA * 60 + mA && atual < hF * 60 + mF;
}

export function mediaUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.includes("backend:8000")) {
    return url.replace("http://backend:8000", "");
  }
  return url;
}