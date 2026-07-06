'use client';

import { useEffect, useRef, useState } from 'react';
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
  cidade: string;
  whatsapp: string;
  website: string;
  seo_title: string;
  seo_description: string;
  palavras_chave: string;
  horario_abertura: string;
  horario_fechamento: string;
  dias_funcionamento: string[];
  cep: string;
  logradouro: string;
  numero: string;
  loc_bairro: string;
  loc_cidade: string;
  estado: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  youtube_url: string;
  linkedin_url: string;
}

const VAZIO_FORM: NegocioForm = {
  nome: '',
  descricao: '',
  historia: '',
  cidade: '',
  whatsapp: '',
  website: '',
  seo_title: '',
  seo_description: '',
  palavras_chave: '',
  horario_abertura: '',
  horario_fechamento: '',
  dias_funcionamento: [],
  cep: '',
  logradouro: '',
  numero: '',
  loc_bairro: '',
  loc_cidade: '',
  estado: '',
  instagram_url: '',
  tiktok_url: '',
  facebook_url: '',
  youtube_url: '',
  linkedin_url: '',
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const sucessoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPro = PLANOS_PRO.includes(plano);

  // ── Popula o form a partir da resposta da API ─────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function popularForm(d: any) {
    setPlano(d.plano ?? 'gratuito');
    if (d.slug && d.cidade && d.categoria?.slug) {
      setNegocioMeta({ slug: d.slug, cidade: d.cidade, categoriaSlug: d.categoria.slug });
    }
    if (d.logo) setLogoUrl(d.logo);
    if (d.og_image) setCapaUrl(d.og_image);
    setForm({
      nome: d.nome ?? '',
      descricao: d.descricao ?? '',
      historia: d.historia ?? '',
      cidade: d.cidade ?? '',
      whatsapp: d.whatsapp ?? '',
      website: d.website ?? '',
      seo_title: d.seo_title ?? '',
      seo_description: d.seo_description ?? '',
      palavras_chave: d.palavras_chave ?? '',
      horario_abertura: d.horario_abertura ?? '',
      horario_fechamento: d.horario_fechamento ?? '',
      dias_funcionamento: Array.isArray(d.dias_funcionamento) ? d.dias_funcionamento : [],
      cep: d.localizacao?.cep ?? '',
      logradouro: d.localizacao?.logradouro ?? '',
      numero: d.localizacao?.numero ?? '',
      loc_bairro: d.localizacao?.bairro ?? '',
      loc_cidade: d.localizacao?.cidade ?? '',
      estado: d.localizacao?.estado ?? '',
      instagram_url: d.redes_sociais?.instagram_url ?? '',
      tiktok_url: d.redes_sociais?.tiktok_url ?? '',
      facebook_url: d.redes_sociais?.facebook_url ?? '',
      youtube_url: d.redes_sociais?.youtube_url ?? '',
      linkedin_url: d.redes_sociais?.linkedin_url ?? '',
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
  }

  // ── Carrega dados do negócio ───────────────────────────────────
  useEffect(() => {
    fetch('/api/proxy/negocios/painel/meu-negocio')
      .then((r) => r.json())
      .then(popularForm)
      .finally(() => setCarregando(false));
    return () => {
      if (sucessoTimer.current) clearTimeout(sucessoTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mutadores ─────────────────────────────────────────────────
  function set(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setSucesso(false);
  }

  function setDias(dias: string[]) {
    setForm((f) => ({ ...f, dias_funcionamento: dias }));
    setSucesso(false);
  }

  function setEE(campo: keyof EspacoEspecialForm, valor: string) {
    setEspaco((e) => ({ ...e, [campo]: valor }));
    setSucesso(false);
  }

  function handleLogo(file: File) {
    setLogoFile(file);
    setLogoUrl(URL.createObjectURL(file));
  }

  function handleCapa(file: File) {
    setCapaFile(file);
    setCapaUrl(URL.createObjectURL(file));
  }

  // ── Salvar ────────────────────────────────────────────────────
  async function salvar() {
    setErro('');
    setSucesso(false);
    if (sucessoTimer.current) clearTimeout(sucessoTimer.current);
    setSalvando(true);
    try {
      const {
        cep,
        logradouro,
        numero,
        loc_bairro,
        loc_cidade,
        estado,
        instagram_url,
        tiktok_url,
        facebook_url,
        youtube_url,
        linkedin_url,
        historia,
        dias_funcionamento,
        ...resto
      } = form;

      // Bug 3: enviar dígitos limpos sem código de país
      const whatsappDigits = resto.whatsapp.replace(/\D/g, '').replace(/^55/, '');
      if (whatsappDigits.length > 0 && (whatsappDigits.length < 10 || whatsappDigits.length > 11)) {
        setErro('WhatsApp inválido — informe DDD + número (10 ou 11 dígitos).');
        return;
      }

      const horario = {
        horario_abertura: resto.horario_abertura || null,
        horario_fechamento: resto.horario_fechamento || null,
      };

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

      const body: Record<string, unknown> = {
        ...resto,
        whatsapp: whatsappDigits,
        ...horario,
        historia,
        dias_funcionamento,
        localizacao: { cep, logradouro, numero, bairro: loc_bairro, cidade: loc_cidade, estado },
        redes_sociais: { instagram_url, tiktok_url, facebook_url, youtube_url, linkedin_url },
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

      // Upload de imagens via multipart PATCH separado (DRF não parseia nested JSON em multipart)
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        await fetch('/api/proxy/negocios/painel/meu-negocio', { method: 'PATCH', body: fd });
        setLogoFile(null);
      }
      if (capaFile) {
        const fd = new FormData();
        fd.append('og_image', capaFile);
        await fetch('/api/proxy/negocios/painel/meu-negocio', { method: 'PATCH', body: fd });
        setCapaFile(null);
      }

      // Bug 2: recarrega dados da API para sincronizar estado com o servidor
      const fresh = await fetch('/api/proxy/negocios/painel/meu-negocio').then((r) => r.json());
      popularForm(fresh);

      // Bug 1: mostra sucesso por 3s e some automaticamente
      setSucesso(true);
      sucessoTimer.current = setTimeout(() => setSucesso(false), 3000);
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
            cidade={form.cidade}
            whatsapp={form.whatsapp}
            website={form.website}
            onChange={set}
          />
          <EnderecoCard
            cep={form.cep}
            logradouro={form.logradouro}
            numero={form.numero}
            loc_bairro={form.loc_bairro}
            loc_cidade={form.loc_cidade}
            estado={form.estado}
            onChange={set}
          />
          <HorarioCard
            horario_abertura={form.horario_abertura}
            horario_fechamento={form.horario_fechamento}
            dias_funcionamento={form.dias_funcionamento}
            onChange={set}
            onDiasChange={setDias}
          />
          <RedesSociaisCard
            instagram_url={form.instagram_url}
            facebook_url={form.facebook_url}
            tiktok_url={form.tiktok_url}
            youtube_url={form.youtube_url}
            linkedin_url={form.linkedin_url}
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
