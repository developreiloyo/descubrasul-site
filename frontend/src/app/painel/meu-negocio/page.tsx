"use client";

import { useEffect, useState } from "react";

interface NegocioForm {
  nome: string;
  descricao: string;
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
}

const VAZIO: NegocioForm = {
  nome: "", descricao: "", bairro: "", whatsapp: "", website: "",
  seo_title: "", seo_description: "", palavras_chave: "",
  horario_abertura: "", horario_fechamento: "",
  cep: "", direccao: "", loc_bairro: "", loc_cidade: "", estado: "",
};

export default function MeuNegocioPage() {
  const [form, setForm] = useState<NegocioForm>(VAZIO);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/proxy/negocios/painel/meu-negocio")
      .then((r) => r.json())
      .then((d) => {
        setForm({
          nome: d.nome ?? "",
          descricao: d.descricao ?? "",
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
        });
      })
      .finally(() => setCarregando(false));
  }, []);

  function set(campo: keyof NegocioForm, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
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

  async function salvar() {
    setErro("");
    setSucesso(false);
    setSalvando(true);
    try {
      // Nao enviar horarios vazios (DRF rejeita string vazia em TimeField)
      const payload: Record<string, string | null> = { ...form };
      if (!payload.horario_abertura) payload.horario_abertura = null;
      if (!payload.horario_fechamento) payload.horario_fechamento = null;

      const { cep, direccao, loc_bairro, loc_cidade, estado, ...resto } = payload;
      const body = {
        ...resto,
        localizacao: { cep, direccao, bairro: loc_bairro, cidade: loc_cidade, estado },
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

  const inputCls =
    "rounded-lg border border-ink/20 bg-white px-4 py-3 outline-none focus:border-primary";
  const labelCls = "text-sm font-medium text-ink/70";

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
        {/* ─── Dados gerais ─────────────────────────── */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Nome do negocio</label>
          <input className={inputCls} value={form.nome}
            onChange={(e) => set("nome", e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Descricao</label>
          <textarea className={inputCls} rows={4} value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Conte o que torna seu negocio unico. Escreva natural — repetir palavras prejudica seu Google." />
          <span className="text-xs text-ink/40">{form.descricao.length} caracteres</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Bairro</label>
            <input className={inputCls} value={form.bairro}
              onChange={(e) => set("bairro", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>WhatsApp</label>
            <input className={inputCls} value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Site (opcional)</label>
          <input className={inputCls} value={form.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="https://..." />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Abre as</label>
            <input className={inputCls} type="time" value={form.horario_abertura}
              onChange={(e) => set("horario_abertura", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Fecha as</label>
            <input className={inputCls} type="time" value={form.horario_fechamento}
              onChange={(e) => set("horario_fechamento", e.target.value)} />
          </div>
        </div>

        {/* ─── Endereco ─────────────────────────────── */}
        <h2 className="mt-4 text-xl font-semibold">Endereco</h2>
        <p className="-mt-3 text-sm text-ink/50">
          Digite o CEP e preenchemos o resto automaticamente.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>CEP</label>
            <input className={inputCls} value={form.cep} maxLength={9}
              placeholder="88801-000"
              onChange={(e) => buscarCep(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Estado</label>
            <input className={inputCls} value={form.estado} maxLength={2}
              onChange={(e) => set("estado", e.target.value.toUpperCase())} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Endereco (rua e numero)</label>
          <input className={inputCls} value={form.direccao}
            onChange={(e) => set("direccao", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Bairro</label>
            <input className={inputCls} value={form.loc_bairro}
              onChange={(e) => set("loc_bairro", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Cidade</label>
            <input className={inputCls} value={form.loc_cidade}
              onChange={(e) => set("loc_cidade", e.target.value)} />
          </div>
        </div>

        {/* ─── SEO ──────────────────────────────────── */}
        <h2 className="mt-4 text-xl font-semibold">Como voce aparece no Google</h2>
        <p className="-mt-3 text-sm text-ink/50">
          Opcional — se deixar em branco, geramos automaticamente.
        </p>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Titulo no Google (max 60)</label>
          <input className={inputCls} maxLength={60} value={form.seo_title}
            onChange={(e) => set("seo_title", e.target.value)}
            placeholder={`Ex: ${form.nome || "Seu Negocio"} em Criciuma | DescubraSul`} />
          <span className={`text-xs ${form.seo_title.length > 55 ? "text-secondary" : "text-ink/40"}`}>
            {form.seo_title.length}/60
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Descricao no Google (max 160)</label>
          <textarea className={inputCls} rows={2} maxLength={160} value={form.seo_description}
            onChange={(e) => set("seo_description", e.target.value)} />
          <span className={`text-xs ${form.seo_description.length > 150 ? "text-secondary" : "text-ink/40"}`}>
            {form.seo_description.length}/160
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Palavras-chave (separadas por virgula)</label>
          <input className={inputCls} value={form.palavras_chave}
            onChange={(e) => set("palavras_chave", e.target.value)}
            placeholder="Ex: pizzaria, pizza artesanal, delivery" />
          <span className="text-xs text-ink/40">
            Usadas na busca interna — nunca aparecem na sua pagina.
          </span>
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}
        {sucesso && <p className="text-sm text-primary">Salvo com sucesso ✓</p>}

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

