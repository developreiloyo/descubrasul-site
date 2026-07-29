// ─── Oferta da Semana ────────────────────────────────────────────────
export interface Oferta {
  id: number;
  titulo: string;
  descricao: string;
  desconto_pct: number | null;
  preco_original: string | null;
  preco_novo: string | null;
  imagem: string | null;
  expira_em: string;
  dias_restantes: number;
  negocio_slug: string;
  negocio_nome: string;
  negocio_logo: string | null;
  negocio_cidade: string;
  negocio_categoria: string;
  negocio_cat_slug: string;
  negocio_whatsapp: string;
}

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
  plano: "gratuito" | "pro" | "producao";
  status: "ativo" | "inativo" | "pendente";
  verificado: boolean;
  seo_title: string;
  seo_description: string;
  og_image: string | null;
  horario_abertura: string | null;
  horario_fechamento: string | null;
  dias_funcionamento: string[];
  atualizado_em: string;
  redes_sociais?: RedesSociais;
  localizacao?: Localizacao;
  videos?: VideoDestaque[];
  espaco_especial?: EspacoEspecial | null;
  palavras_chave?: string | null;
  google_place_id?: string;
}

// ─── Google Reviews ──────────────────────────────────────────────────
export interface GoogleReview {
  autor: string;
  foto: string | null;
  nota: number;
  texto: string;
  tempo: string;
}

export interface GoogleReviewData {
  rating: number;
  total: number;
  url: string;
  reviews: GoogleReview[];
}

// ─── Produto ────────────────────────────────────────────────────────
export interface FotoProduto {
  id: number;
  foto: string;
  alt_texto: string;
  ordem: number;
}

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
  fotos: FotoProduto[];
  video_youtube_url?: string | null;
  negocio: {
    slug: string;
    nome: string;
    cidade: string;
    categoria: string;
    categoria_slug: string;
    whatsapp: string;
  };
}

// ─── Redes Sociais ──────────────────────────────────────────────────
export interface RedesSociais {
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
}

// ─── Localização ────────────────────────────────────────────────────
export interface Localizacao {
  direccao_fmt: string;
  lat: string | null;
  lng: string | null;
  cidade: string;
  bairro: string;
  area_servico?: string;
}

// ─── Categoria ──────────────────────────────────────────────────────
export interface Categoria {
  slug: string;
  nome: string;
  icone: string;
}

// ─── VideoDestaque ──────────────────────────────────────────────────
export interface VideoDestaque {
  plataforma: string;
  oembed_html: string;
  criado_em: string;
}

// ─── Espaço Especial (plano Pro+) ───────────────────────────────────
export interface EspacoEspecial {
  tipo: "texto" | "oferta" | "cupom" | "banner" | "video";
  titulo?: string;
  conteudo?: string;
  badge?: string;
  cta_texto?: string;
  cta_link?: string;
  desconto?: string;
  codigo?: string;
  imagem_url?: string;
  imagem_alt?: string;
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
