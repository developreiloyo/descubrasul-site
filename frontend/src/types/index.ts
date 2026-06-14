// ─── Negócio ────────────────────────────────────────────────────────
export interface Negocio {
  id: number;
  slug: string;
  nome: string;
  descricao: string;
  historia: string;
  logo: string | null;
  alt_logo: string;
  categoria: Categoria;
  categoria_tipo: string;
  cidade: string;
  bairro: string;
  whatsapp: string;
  website: string | null;
  plano: "gratuito" | "basico" | "pro" | "producao" | "fundador";
  status: "ativo" | "inativo" | "pendente";
  verificado: boolean;
  seo_title: string;
  seo_description: string;
  og_image: string | null;
  media_nota: string;
  total_avaliacoes: number;
  horario_abertura: string | null;
  horario_fechamento: string | null;
  dias_funcionamento: string[];
  atualizado_em: string;
  redes_sociais?: RedesSociais;
  localizacao?: Localizacao;
}

// ─── Produto ────────────────────────────────────────────────────────
export interface Produto {
  id: number;
  slug: string;
  nome: string;
  descricao: string;
  descricao_longa: string;
  foto: string | null;
  alt_foto: string;
  categoria: string;
  preco: string | null;
  disponivel: boolean;
  atualizado_em: string;
  negocio: Pick<Negocio, "slug" | "nome" | "cidade" | "categoria" | "whatsapp">;
}

// ─── Redes Sociais ──────────────────────────────────────────────────
export interface RedesSociais {
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  x_url: string | null;
}

// ─── Localização ────────────────────────────────────────────────────
export interface Localizacao {
  direccao_fmt: string;
  lat: string;
  lng: string;
  cidade: string;
  bairro: string;
}

// ─── Categoria ──────────────────────────────────────────────────────
export interface Categoria {
  slug: string;
  nome: string;
  icone: string;
}

// ─── Analytics AARRR ────────────────────────────────────────────────
export interface MetricaDiaria {
  data: string;
  total_views: number;
  total_whatsapp: number;
  total_shares: number;
  taxa_conversao: string;
  origem_google: number;
  origem_instagram: number;
  origem_direto: number;
}
