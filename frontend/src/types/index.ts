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
  videos?: VideoDestaque[];
  espaco_especial?: EspacoEspecial | null;
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
  x_url: string | null;
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
