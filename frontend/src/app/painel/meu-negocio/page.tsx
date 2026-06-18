"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

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

type TipoEspaco = "texto" | "oferta" | "cupom" | "video" | "";

interface EspacoEspecialForm {
  tipo: TipoEspaco;
  titulo: string;
  conteudo: string;
  badge: string;
  cta_texto: string;
  cta_link: string;
  desconto: string;
  codigo: string;
}

const VAZIO_FORM: NegocioForm = {
  nome: "", descricao: "", historia: "", bairro: "", whatsapp: "", website: "",
  seo_title: "", seo_description: "", palavras_chave: "",
  horario_abertura: "", horario_fechamento: "",
  cep: "", direccao: "", loc_bairro: "", loc_cidade: "", estado: "",
  instagram_url: "", tiktok_url: "", facebook_url: "", youtube_url: "", x_url: "",
};

const VAZIO_ESPACO: EspacoEspecialForm = {
  tipo: "", titulo: "", conteudo: "", badge: "",
  cta_texto: "", cta_link: "", desconto: "", codigo: "",
};

const PLANOS_PRO = ["pro", "producao", "fundador"];

const TIPO_LABELS: Record<TipoEspaco, string> = {
  "":      "Desativado",
  texto:   "Texto em destaque",
  oferta:  "Oferta / Promoção",
  cupom:   "Cupom de desconto",
  video:   "Vídeo em destaque",
};

// ─── Helpers de UI ───────────────────────────────────────────────────
const inputCls =
  "rounded-lg border border-ink/20 bg-white px-4 py-3 outline-none focus:border-primary w-full";
const labelCls = "text-sm font-medium text-ink/70";

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <span className="text-xs text-ink/40">{hint}</span>}
    </div>
  );
}

// ─── Página ──────────────────────────────────────────────────────────
export default function MeuNegocioPage() {
  const [form, setForm]           = useState<NegocioForm>(VAZIO_FORM);
  const [espaco, setEspaco]       = useState<EspacoEspecialForm>(VAZIO_ESPACO);
  const [plano, setPlano]         = useState<string>("gratuito");
  const [erro, setErro]           = useState("");
  const [sucesso, setSucesso]     = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando]   = useState(false);

  const isPro = PLANOS_PRO.includes(plano);

  // ── Carrega dados do negocio ───────────────────────────────────
  useEffect(() => {
    fetch("/api/proxy/negocios/painel/meu-negocio")
      .then((r) => r.json())
      .then((d) => {
        setPlano(d.plano ?? "gratuito");
        setForm({
          nome: d.nome ?? "",
          descricao: d.descricao ?? "",
          historia: d.historia ?? "",
          bairro: d.bairro ?? "",
          whatsapp: d.whatsapp ?? "",
          website: d.website ?? "",
          seo_title: d.seo_title ?? "",
          seo_description: d.seo_description ?? "",
          palavras_chave: d.palavras_chave ?? "",
          horario_abertura: d.horario_abertura ?? "",
          horario_fechamento: d.horario_fechamento ?? "",
          cep: d.localizacao?.cep ?? "",
          direccao: d.localizacao?.direccao ?? "",
          loc_bairro: d.localizacao?.bairro ?? "",
          loc_cidade: d.localizacao?.cidade ?? "",
          estado: d.localizacao?.estado ?? "",
          instagram_url: d.redes_sociais?.instagram_url ?? "",
          tiktok_url: d.redes_sociais?.tiktok_url ?? "",
          facebook_url: d.redes_sociais?.facebook_url ?? "",
          youtube_url: d.redes_sociais?.youtube_url ?? "",
          x_url: d.redes_sociais?.x_url ?? "",
        });
        const ee = d.espaco_especial;
        if (ee) {
          setEspaco({
            tipo:      ee.tipo      ?? "",
            titulo:    ee.titulo    ?? "",
            conteudo:  ee.conteudo  ?? "",
            badge:     ee.badge     ?? "",
            cta_texto: ee.cta_texto ?? "",
            cta_link:  ee.cta_link  ?? "",
            desconto:  ee.desconto  ?? "",
            codigo:    ee.codigo    ?? "",
          });
        }
      })
      .finally(() => setCarregando(false));
  }, []);

  // ── Mutadores ─────────────────────────────────────────────────
  function set(campo: keyof NegocioForm, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setSucesso(false);
  }

  function setEE(campo: keyof EspacoEspecialForm, valor: string) {
    setEspaco((e) => ({ ...e, [campo]: valor }));
    setSucesso(false);
  }

  async function buscarCep(cep: string) {
    const limpo = cep.replace(/\D/g, "");
    set("cep", cep);
    if (limpo.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const d = await res.json();
      if (d.erro) return;
      setForm((f) => ({
        ...f,
        direccao: d.logradouro || f.direccao,
        loc_bairro: d.bairro || f.loc_bairro,
        loc_cidade: d.localidade || f.loc_cidade,
        estado: d.uf || f.estado,
      }));
    } catch {
      // ViaCEP fora do ar — comerciante preenche manual
    }
  }

  // ── Salvar ────────────────────────────────────────────────────
  async function salvar() {
    setErro("");
    setSucesso(false);
    setSalvando(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (!payload.horario_abertura)  payload.horario_abertura = null;
      if (!payload.horario_fechamento) payload.horario_fechamento = null;

      const {
        cep, direccao, loc_bairro, loc_cidade, estado,
        instagram_url, tiktok_url, facebook_url, youtube_url, x_url,
        historia,
        ...resto
      } = payload as Record<string, string | null>;

      // Espaço especial: null quando desativado, objeto quando configurado
      let espacoPayload: Record<string, string> | null = null;
      if (isPro && espaco.tipo) {
        espacoPayload = { tipo: espaco.tipo };
        if (espaco.titulo)    espacoPayload.titulo    = espaco.titulo;
        if (espaco.conteudo)  espacoPayload.conteudo  = espaco.conteudo;
        if (espaco.badge)     espacoPayload.badge     = espaco.badge;
        if (espaco.cta_texto) espacoPayload.cta_texto = espaco.cta_texto;
        if (espaco.cta_link)  espacoPayload.cta_link  = espaco.cta_link;
        if (espaco.desconto)  espacoPayload.desconto  = espaco.desconto;
        if (espaco.codigo)    espacoPayload.codigo    = espaco.codigo;
      }

      const body = {
        ...resto,
        historia,
        localizacao: { cep, direccao, bairro: loc_bairro, cidade: loc_cidade, estado },
        redes_sociais: { instagram_url, tiktok_url, facebook_url, youtube_url, x_url },
        espaco_especial: espacoPayload,
      };

      const res = await fetch("/api/proxy/negocios/painel/meu-negocio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const primeiro = Object.values(d)[0];
        setErro(Array.isArray(primeiro) ? String(primeiro[0]) : "Erro ao salvar.");
        return;
      }
      setSucesso(true);
    } catch {
      setErro("Erro de conexao.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <main className="mx-auto max-w-2xl px-4 py-12">Carregando...</main>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Meu Negocio</h1>
      <p className="mt-2 text-ink/60">
        Estas informacoes aparecem na sua pagina publica e no Google.
      </p>

      <div className="mt-8 flex flex-col gap-5">

        {/* ─── Dados gerais ───────────────────────────────────── */}
        <Field label="Nome do negocio">
          <input className={inputCls} value={form.nome}
            onChange={(e) => set("nome", e.target.value)} />
        </Field>

        <Field
          label="Descricao curta"
          hint={`${form.descricao.length} caracteres`}
        >
          <textarea className={inputCls} rows={3} value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Frase de impacto sobre o negocio — aparece nos resultados de busca e nas listas." />
        </Field>

        <Field
          label="Historia do negocio"
          hint={`${form.historia.length} caracteres · Pode usar paragrafos`}
        >
          <textarea className={inputCls} rows={7} value={form.historia}
            onChange={(e) => set("historia", e.target.value)}
            placeholder={`Conte a historia do seu negocio. Quando surgiu? O que o torna especial? Quem e o fundador?`} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Bairro">
            <input className={inputCls} value={form.bairro}
              onChange={(e) => set("bairro", e.target.value)} />
          </Field>
          <Field label="WhatsApp">
            <input className={inputCls} value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>
        </div>

        <Field label="Site (opcional)">
          <input className={inputCls} value={form.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="https://..." />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Abre as">
            <input className={inputCls} type="time" value={form.horario_abertura}
              onChange={(e) => set("horario_abertura", e.target.value)} />
          </Field>
          <Field label="Fecha as">
            <input className={inputCls} type="time" value={form.horario_fechamento}
              onChange={(e) => set("horario_fechamento", e.target.value)} />
          </Field>
        </div>

        {/* ─── Endereco ───────────────────────────────────────── */}
        <h2 className="mt-4 text-xl font-semibold">Endereco</h2>
        <p className="-mt-3 text-sm text-ink/50">
          Digite o CEP e preenchemos o resto automaticamente.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="CEP">
            <input className={inputCls} value={form.cep} maxLength={9}
              placeholder="88801-000"
              onChange={(e) => buscarCep(e.target.value)} />
          </Field>
          <Field label="Estado">
            <input className={inputCls} value={form.estado} maxLength={2}
              onChange={(e) => set("estado", e.target.value.toUpperCase())} />
          </Field>
        </div>

        <Field label="Endereco (rua e numero)">
          <input className={inputCls} value={form.direccao}
            onChange={(e) => set("direccao", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Bairro">
            <input className={inputCls} value={form.loc_bairro}
              onChange={(e) => set("loc_bairro", e.target.value)} />
          </Field>
          <Field label="Cidade">
            <input className={inputCls} value={form.loc_cidade}
              onChange={(e) => set("loc_cidade", e.target.value)} />
          </Field>
        </div>

        {/* ─── Redes sociais ──────────────────────────────────── */}
        <h2 className="mt-4 text-xl font-semibold">Redes sociais</h2>
        <p className="-mt-3 text-sm text-ink/50">
          Aparecem na sua pagina e ajudam o Google a conectar seus perfis.
        </p>

        <Field label="Instagram">
          <input className={inputCls} value={form.instagram_url}
            placeholder="https://instagram.com/seunegocio"
            onChange={(e) => set("instagram_url", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Facebook">
            <input className={inputCls} value={form.facebook_url}
              placeholder="https://facebook.com/..."
              onChange={(e) => set("facebook_url", e.target.value)} />
          </Field>
          <Field label="TikTok">
            <input className={inputCls} value={form.tiktok_url}
              placeholder="https://tiktok.com/@..."
              onChange={(e) => set("tiktok_url", e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="YouTube">
            <input className={inputCls} value={form.youtube_url}
              placeholder="https://youtube.com/@..."
              onChange={(e) => set("youtube_url", e.target.value)} />
          </Field>
          <Field label="X (Twitter)">
            <input className={inputCls} value={form.x_url}
              placeholder="https://x.com/..."
              onChange={(e) => set("x_url", e.target.value)} />
          </Field>
        </div>

        {/* ─── Espaco especial ────────────────────────────────── */}
        <EspacoEspecialSection
          isPro={isPro}
          plano={plano}
          espaco={espaco}
          onChange={setEE}
        />

        {/* ─── SEO ────────────────────────────────────────────── */}
        <h2 className="mt-4 text-xl font-semibold">Como voce aparece no Google</h2>
        <p className="-mt-3 text-sm text-ink/50">
          Opcional — se deixar em branco, geramos automaticamente.
        </p>

        <Field
          label="Titulo no Google (max 60)"
          hint={`${form.seo_title.length}/60`}
        >
          <input className={`${inputCls} ${form.seo_title.length > 55 ? "border-amber-400" : ""}`}
            maxLength={60} value={form.seo_title}
            onChange={(e) => set("seo_title", e.target.value)}
            placeholder={`Ex: ${form.nome || "Seu Negocio"} em Criciuma | DescubraSul`} />
        </Field>

        <Field
          label="Descricao no Google (max 160)"
          hint={`${form.seo_description.length}/160`}
        >
          <textarea className={`${inputCls} ${form.seo_description.length > 150 ? "border-amber-400" : ""}`}
            rows={2} maxLength={160} value={form.seo_description}
            onChange={(e) => set("seo_description", e.target.value)} />
        </Field>

        <Field
          label="Palavras-chave (separadas por virgula)"
          hint="Usadas na busca interna — nunca aparecem na sua pagina."
        >
          <input className={inputCls} value={form.palavras_chave}
            onChange={(e) => set("palavras_chave", e.target.value)}
            placeholder="Ex: pizzaria, pizza artesanal, delivery" />
        </Field>

        {/* ─── Feedback + botao ───────────────────────────────── */}
        {erro    && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
        {sucesso && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Salvo com sucesso ✓</p>}

        <button
          onClick={salvar}
          disabled={salvando}
          className="rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar alteracoes"}
        </button>
      </div>
    </main>
  );
}

// ─── Seção de Espaço Especial ────────────────────────────────────────
function EspacoEspecialSection({
  isPro, plano, espaco, onChange,
}: {
  isPro: boolean;
  plano: string;
  espaco: EspacoEspecialForm;
  onChange: (campo: keyof EspacoEspecialForm, valor: string) => void;
}) {
  const inputCls =
    "rounded-lg border border-ink/20 bg-white px-4 py-3 outline-none focus:border-primary w-full";
  const labelCls = "text-sm font-medium text-ink/70";

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Espaco especial</h2>
          <p className="mt-0.5 text-sm text-ink/50">
            Secao em destaque visual na sua pagina publica — ideal para ofertas, cupons ou destaques.
          </p>
        </div>
        {isPro ? (
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            {plano.charAt(0).toUpperCase() + plano.slice(1)}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-ink/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink/40">
            Pro+
          </span>
        )}
      </div>

      {/* Bloqueio para planos gratuito/basico */}
      {!isPro ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/20 bg-ink/[0.02] px-6 py-8 text-center">
          <Lock className="size-8 text-ink/20" />
          <p className="text-sm font-medium text-ink/50">
            Disponivel nos planos Pro, Producao e Fundador.
          </p>
          <a
            href="/planos"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Fazer upgrade
          </a>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/[0.02] p-5">

          {/* Tipo */}
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Tipo de conteudo</label>
            <select
              className={inputCls}
              value={espaco.tipo}
              onChange={(e) => onChange("tipo", e.target.value)}
            >
              {(Object.entries(TIPO_LABELS) as [TipoEspaco, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Campos por tipo */}
          {espaco.tipo === "" && (
            <p className="text-sm text-ink/50">
              Selecione um tipo para ativar o espaco especial na sua pagina publica.
            </p>
          )}

          {espaco.tipo === "video" && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              O video em destaque e gerenciado pela equipe DescubraSul via VideoDestaque.
              Entre em contato para configurar.
            </div>
          )}

          {(espaco.tipo === "texto" || espaco.tipo === "oferta" || espaco.tipo === "cupom") && (
            <>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Badge (etiqueta, opcional)</label>
                <input className={inputCls} value={espaco.badge}
                  placeholder="Ex: Novidade, Limitado, Exclusivo"
                  onChange={(e) => onChange("badge", e.target.value)} />
                <span className="text-xs text-ink/40">Aparece em destaque acima do titulo.</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelCls}>Titulo</label>
                <input className={inputCls} value={espaco.titulo}
                  placeholder={
                    espaco.tipo === "oferta" ? "Ex: 20% off no combo de verao!" :
                    espaco.tipo === "cupom"  ? "Ex: Desconto exclusivo para voce!" :
                    "Ex: Conheca nosso servico premium"
                  }
                  onChange={(e) => onChange("titulo", e.target.value)} />
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelCls}>Texto de apoio (opcional)</label>
                <textarea className={inputCls} rows={2} value={espaco.conteudo}
                  placeholder="Descricao complementar da oferta ou destaque."
                  onChange={(e) => onChange("conteudo", e.target.value)} />
              </div>
            </>
          )}

          {espaco.tipo === "oferta" && (
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Percentual de desconto (opcional)</label>
              <input className={inputCls} value={espaco.desconto}
                placeholder="Ex: 20%"
                onChange={(e) => onChange("desconto", e.target.value)} />
            </div>
          )}

          {espaco.tipo === "cupom" && (
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Codigo do cupom</label>
              <input
                className={`${inputCls} font-mono tracking-widest uppercase`}
                value={espaco.codigo}
                placeholder="Ex: DESCUBRA10"
                onChange={(e) => onChange("codigo", e.target.value.toUpperCase())}
              />
              <span className="text-xs text-ink/40">
                O visitante ve e copia este codigo na sua pagina.
              </span>
            </div>
          )}

          {(espaco.tipo === "texto" || espaco.tipo === "oferta") && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Botao — texto (opcional)</label>
                <input className={inputCls} value={espaco.cta_texto}
                  placeholder="Ex: Saiba mais"
                  onChange={(e) => onChange("cta_texto", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Botao — link (opcional)</label>
                <input className={inputCls} value={espaco.cta_link}
                  placeholder="https://..."
                  onChange={(e) => onChange("cta_link", e.target.value)} />
              </div>
            </div>
          )}

          {/* Preview vivo */}
          {espaco.tipo && espaco.tipo !== "video" && (
            <div className="mt-1 rounded-xl bg-gradient-to-br from-primary to-teal-700 p-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
                Preview
              </p>
              {espaco.badge && (
                <span className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                  {espaco.badge}
                </span>
              )}
              {espaco.titulo && (
                <p className="text-lg font-bold text-white">{espaco.titulo}</p>
              )}
              {espaco.conteudo && (
                <p className="mt-1 text-sm text-white/80">{espaco.conteudo}</p>
              )}
              {espaco.tipo === "oferta" && espaco.desconto && (
                <p className="mt-2 text-3xl font-black text-white">{espaco.desconto} OFF</p>
              )}
              {espaco.tipo === "cupom" && espaco.codigo && (
                <div className="mt-3 w-fit rounded-xl border-2 border-dashed border-white/40 bg-white/10 px-5 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Codigo</p>
                  <p className="text-xl font-black tracking-widest text-white">{espaco.codigo}</p>
                </div>
              )}
              {espaco.cta_texto && (
                <div className="mt-3 inline-block rounded-xl bg-white px-4 py-2 text-sm font-bold text-primary">
                  {espaco.cta_texto}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
