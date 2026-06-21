'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { InformacoesBasicasCard } from '@/components/merchant/meu-negocio/InformacoesBasicasCard';
import { EnderecoCard } from '@/components/merchant/meu-negocio/EnderecoCard';
import { HorarioCard } from '@/components/merchant/meu-negocio/HorarioCard';
import { RedesSociaisCard } from '@/components/merchant/meu-negocio/RedesSociaisCard';
import { EspacoEspecialCard } from '@/components/merchant/meu-negocio/EspacoEspecialCard';
import { SeoCard } from '@/components/merchant/meu-negocio/SeoCard';
import { StatusCard } from '@/components/merchant/meu-negocio/StatusCard';
import { LogoCapaCard } from '@/components/merchant/meu-negocio/LogoCapaCard';
import { DicasCard } from '@/components/merchant/meu-negocio/DicasCard';
import { QRCodeCard } from '@/components/ui/QRCodeCard';
import type { EspacoEspecialForm } from '@/components/merchant/meu-negocio/EspacoEspecialCard';

// ─── Tipos ───────────────────────────────────────────────────────────
interface NegocioForm {
  nome: string;
  descricao: string;
  historia: string;
  bairro: string;
  whatsapp: string;
  website: string;
  seo_title: string;
  seo_description: string;
  palavras_chave: string;
  horario_abertura: string;
  horario_fechamento: string;
  cep: string;
  direccao: string;
  loc_bairro: string;
  loc_cidade: string;
  estado: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  youtube_url: string;
  x_url: string;
}

const VAZIO_FORM: NegocioForm = {
  nome: '',
  descricao: '',
  historia: '',
  bairro: '',
  whatsapp: '',
  website: '',
  seo_title: '',
  seo_description: '',
  palavras_chave: '',
  horario_abertura: '',
  horario_fechamento: '',
  cep: '',
  direccao: '',
  loc_bairro: '',
  loc_cidade: '',
  estado: '',
  instagram_url: '',
  tiktok_url: '',
  facebook_url: '',
  youtube_url: '',
  x_url: '',
};

const VAZIO_ESPACO: EspacoEspecialForm = {
  tipo: '',
  titulo: '',
  conteudo: '',
  badge: '',
  cta_texto: '',
  cta_link: '',
  desconto: '',
  codigo: '',
};

const PLANOS_PRO = ['pro', 'producao', 'fundador'];

// ─── Página ──────────────────────────────────────────────────────────
export default function MeuNegocioPage() {
  const [form, setForm] = useState<NegocioForm>(VAZIO_FORM);
  const [espaco, setEspaco] = useState<EspacoEspecialForm>(VAZIO_ESPACO);
  const [plano, setPlano] = useState<string>('gratuito');
  const [negocioMeta, setNegocioMeta] = useState<{
    slug: string;
    cidade: string;
    categoriaSlug: string;
  } | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [capaUrl, setCapaUrl] = useState<string | undefined>(undefined);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const isPro = PLANOS_PRO.includes(plano);

  // ── Carrega dados do negócio ───────────────────────────────────
  useEffect(() => {
    fetch('/api/proxy/negocios/painel/meu-negocio')
      .then((r) => r.json())
      .then((d) => {
        setPlano(d.plano ?? 'gratuito');
        if (d.slug && d.cidade && d.categoria?.slug) {
          setNegocioMeta({
            slug: d.slug,
            cidade: d.cidade,
            categoriaSlug: d.categoria.slug,
          });
        }
        if (d.logo) setLogoUrl(d.logo);
        setForm({
          nome: d.nome ?? '',
          descricao: d.descricao ?? '',
          historia: d.historia ?? '',
          bairro: d.bairro ?? '',
          whatsapp: d.whatsapp ?? '',
          website: d.website ?? '',
          seo_title: d.seo_title ?? '',
          seo_description: d.seo_description ?? '',
          palavras_chave: d.palavras_chave ?? '',
          horario_abertura: d.horario_abertura ?? '',
          horario_fechamento: d.horario_fechamento ?? '',
          cep: d.localizacao?.cep ?? '',
          direccao: d.localizacao?.direccao ?? '',
          loc_bairro: d.localizacao?.bairro ?? '',
          loc_cidade: d.localizacao?.cidade ?? '',
          estado: d.localizacao?.estado ?? '',
          instagram_url: d.redes_sociais?.instagram_url ?? '',
          tiktok_url: d.redes_sociais?.tiktok_url ?? '',
          facebook_url: d.redes_sociais?.facebook_url ?? '',
          youtube_url: d.redes_sociais?.youtube_url ?? '',
          x_url: d.redes_sociais?.x_url ?? '',
        });
        const ee = d.espaco_especial;
        if (ee) {
          setEspaco({
            tipo: ee.tipo ?? '',
            titulo: ee.titulo ?? '',
            conteudo: ee.conteudo ?? '',
            badge: ee.badge ?? '',
            cta_texto: ee.cta_texto ?? '',
            cta_link: ee.cta_link ?? '',
            desconto: ee.desconto ?? '',
            codigo: ee.codigo ?? '',
          });
        }
      })
      .finally(() => setCarregando(false));
  }, []);

  // ── Mutadores ─────────────────────────────────────────────────
  function set(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setSucesso(false);
  }

  function setEE(campo: keyof EspacoEspecialForm, valor: string) {
    setEspaco((e) => ({ ...e, [campo]: valor }));
    setSucesso(false);
  }

  function handleLogo(file: File) {
    setLogoUrl(URL.createObjectURL(file));
  }

  function handleCapa(file: File) {
    setCapaUrl(URL.createObjectURL(file));
  }

  // ── Salvar ────────────────────────────────────────────────────
  async function salvar() {
    setErro('');
    setSucesso(false);
    setSalvando(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (!payload.horario_abertura) payload.horario_abertura = null;
      if (!payload.horario_fechamento) payload.horario_fechamento = null;

      const {
        cep,
        direccao,
        loc_bairro,
        loc_cidade,
        estado,
        instagram_url,
        tiktok_url,
        facebook_url,
        youtube_url,
        x_url,
        historia,
        ...resto
      } = payload as Record<string, string | null>;

      // Espaço especial: null quando desativado, objeto quando configurado
      let espacoPayload: Record<string, string> | null = null;
      if (isPro && espaco.tipo) {
        espacoPayload = { tipo: espaco.tipo };
        if (espaco.titulo) espacoPayload.titulo = espaco.titulo;
        if (espaco.conteudo) espacoPayload.conteudo = espaco.conteudo;
        if (espaco.badge) espacoPayload.badge = espaco.badge;
        if (espaco.cta_texto) espacoPayload.cta_texto = espaco.cta_texto;
        if (espaco.cta_link) espacoPayload.cta_link = espaco.cta_link;
        if (espaco.desconto) espacoPayload.desconto = espaco.desconto;
        if (espaco.codigo) espacoPayload.codigo = espaco.codigo;
      }

      const body = {
        ...resto,
        historia,
        localizacao: { cep, direccao, bairro: loc_bairro, cidade: loc_cidade, estado },
        redes_sociais: { instagram_url, tiktok_url, facebook_url, youtube_url, x_url },
        espaco_especial: espacoPayload,
      };

      const res = await fetch('/api/proxy/negocios/painel/meu-negocio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const primeiro = Object.values(d)[0];
        setErro(Array.isArray(primeiro) ? String(primeiro[0]) : 'Erro ao salvar.');
        return;
      }
      setSucesso(true);
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-ink-muted">
          <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ink">Meu Negócio</h1>
          <p className="text-sm text-ink-muted mt-1">
            Edite as informações do seu negócio
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {erro && (
            <p className="rounded-lg bg-error-bg px-4 py-2 text-sm text-error">{erro}</p>
          )}
          {sucesso && (
            <p className="rounded-lg bg-success-bg px-4 py-2 text-sm text-brand-green-dark">
              Salvo com sucesso ✓
            </p>
          )}
          <button
            onClick={salvar}
            disabled={salvando}
            className="bg-brand-green hover:bg-brand-green-dark text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-card hover:shadow-card-hover transition-all active:scale-95 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </header>

      {/* Grid 8+4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <InformacoesBasicasCard
            nome={form.nome}
            descricao={form.descricao}
            historia={form.historia}
            bairro={form.bairro}
            whatsapp={form.whatsapp}
            website={form.website}
            onChange={set}
          />
          <EnderecoCard
            cep={form.cep}
            direccao={form.direccao}
            loc_bairro={form.loc_bairro}
            loc_cidade={form.loc_cidade}
            estado={form.estado}
            onChange={set}
          />
          <HorarioCard
            horario_abertura={form.horario_abertura}
            horario_fechamento={form.horario_fechamento}
            onChange={set}
          />
          <RedesSociaisCard
            instagram_url={form.instagram_url}
            facebook_url={form.facebook_url}
            tiktok_url={form.tiktok_url}
            youtube_url={form.youtube_url}
            x_url={form.x_url}
            onChange={set}
          />
          <EspacoEspecialCard
            isPro={isPro}
            plano={plano}
            espaco={espaco}
            onChange={setEE}
          />
          <SeoCard
            nome={form.nome}
            seo_title={form.seo_title}
            seo_description={form.seo_description}
            palavras_chave={form.palavras_chave}
            onChange={set}
          />
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
          <StatusCard
            status="publicado"
            plano={plano}
            slug={negocioMeta?.slug}
            cidade={negocioMeta?.cidade}
            categoriaSlug={negocioMeta?.categoriaSlug}
          />
          <LogoCapaCard logoUrl={logoUrl} capaUrl={capaUrl} onLogoChange={handleLogo} onCapaChange={handleCapa} />
          <DicasCard />
          {negocioMeta && (
            <QRCodeCard
              slug={negocioMeta.slug}
              cidade={negocioMeta.cidade}
              categoriaSlug={negocioMeta.categoriaSlug}
              nomeNegocio={form.nome}
            />
          )}
        </aside>
      </div>
    </>
  );
}
