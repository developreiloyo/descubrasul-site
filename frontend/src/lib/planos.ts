export type PlanoSlug = "gratuito" | "pro" | "producao";

export interface PlanoFeatures {
  label: string;
  permite_capa: boolean;
  permite_historia: boolean;
  permite_website: boolean;
  permite_email_contato: boolean;
  permite_redes_sociais: boolean;
  permite_galeria: boolean;
  permite_video: boolean;
  permite_espaco_especial: boolean;
  limite_produtos: number;
  fotos_por_produto: number;
  limite_galeria: number;
}

export const PLANOS: Record<PlanoSlug, PlanoFeatures> = {
  gratuito: {
    label: "Presença Sul",
    permite_capa: false,
    permite_historia: false,
    permite_website: false,
    permite_email_contato: false,
    permite_redes_sociais: false,
    permite_galeria: false,
    permite_video: false,
    permite_espaco_especial: false,
    limite_produtos: 5,
    fotos_por_produto: 1,
    limite_galeria: 0,
  },
  pro: {
    label: "Conexão Sul",
    permite_capa: true,
    permite_historia: true,
    permite_website: true,
    permite_email_contato: true,
    permite_redes_sociais: true,
    permite_galeria: true,
    permite_video: false,
    permite_espaco_especial: true,
    limite_produtos: 5,
    fotos_por_produto: 3,
    limite_galeria: 10,
  },
  producao: {
    label: "Destaque Sul",
    permite_capa: true,
    permite_historia: true,
    permite_website: true,
    permite_email_contato: true,
    permite_redes_sociais: true,
    permite_galeria: true,
    permite_video: true,
    permite_espaco_especial: true,
    limite_produtos: 10,
    fotos_por_produto: 3,
    limite_galeria: 10,
  },
};

export function getPlanoFeatures(plano: string): PlanoFeatures {
  return PLANOS[plano as PlanoSlug] ?? PLANOS.gratuito;
}

export function isPlanoProOuSuperior(plano: string): boolean {
  return plano === "pro" || plano === "producao";
}
