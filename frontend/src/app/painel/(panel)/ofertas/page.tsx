"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag, Clock, CheckCircle2, XCircle, AlertCircle, Plus, ExternalLink } from "lucide-react";
import type { Oferta } from "@/types";

const PLANOS_PAGOS = ["basico", "pro", "producao", "fundador"];

interface MinhaOferta {
  id: number;
  titulo: string;
  status: "pendente" | "ativa" | "expirada" | "cancelada";
  desconto_pct: number | null;
  preco_original: string | null;
  preco_novo: string | null;
  publicado_em: string | null;
  expira_em: string | null;
  dias_restantes: number;
  mp_preference_id: string;
}

interface FormData {
  titulo: string;
  descricao: string;
  desconto_pct: string;
  preco_original: string;
  preco_novo: string;
}

const EMPTY_FORM: FormData = {
  titulo: "",
  descricao: "",
  desconto_pct: "",
  preco_original: "",
  preco_novo: "",
};

function StatusBadge({ status }: { status: MinhaOferta["status"] }) {
  const map = {
    pendente:  { label: "Aguardando pagamento", icon: AlertCircle, cls: "bg-amber-50 text-amber-700 border-amber-200" },
    ativa:     { label: "Ativa",                icon: CheckCircle2, cls: "bg-green-50 text-green-700 border-green-200" },
    expirada:  { label: "Expirada",             icon: Clock,        cls: "bg-gray-100 text-gray-500 border-gray-200"  },
    cancelada: { label: "Cancelada",            icon: XCircle,      cls: "bg-red-50 text-red-600 border-red-200"     },
  };
  const { label, icon: Icon, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cls}`}>
      <Icon className="size-3.5" /> {label}
    </span>
  );
}

export default function OfertasPainelPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ plano?: string } | null>(null);
  const [ofertas, setOfertas] = useState<MinhaOferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function load() {
      const [meRes, ofRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/proxy/ofertas/minhas/"),
      ]);
      if (!meRes.ok) { router.push("/painel/login"); return; }
      const me = await meRes.json();
      setUser(me);
      if (ofRes.ok) {
        const data = await ofRes.json();
        setOfertas(Array.isArray(data) ? data : (data.results ?? []));
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const temAtivaPendente = ofertas.some(o => o.status === "ativa" || o.status === "pendente");
  const planoPago = PLANOS_PAGOS.includes(user?.plano ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const body: Record<string, unknown> = {
        titulo: form.titulo,
        descricao: form.descricao,
        back_url: window.location.origin + "/painel/ofertas",
      };
      if (form.desconto_pct)   body.desconto_pct   = parseInt(form.desconto_pct);
      if (form.preco_original) body.preco_original = form.preco_original;
      if (form.preco_novo)     body.preco_novo     = form.preco_novo;

      const res = await fetch("/api/proxy/ofertas/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ?? JSON.stringify(data));
        return;
      }
      window.location.href = data.init_point;
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-[760px] mx-auto px-4 py-12 text-center text-[#6b6561]">
        Carregando…
      </div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto px-4 py-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-[#1a1a1a] font-bold">Ofertas da Semana</h1>
          <p className="text-sm text-[#6b6561] mt-1">
            Publique uma oferta na página principal por 7 dias — R$&nbsp;20 por publicação.
          </p>
        </div>
        {planoPago && !temAtivaPendente && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-[#1a7a3c] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#15633a] transition-colors"
          >
            <Plus className="size-4" /> Nova oferta
          </button>
        )}
      </div>

      {/* ── Plano gratuito — bloqueio ── */}
      {!planoPago && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 mb-1">Recurso exclusivo para planos pagos</p>
            <p className="text-sm text-amber-800">
              Ofertas da Semana estão disponíveis a partir do Plano Básico. Faça o upgrade para publicar sua oferta na página inicial e alcançar mais clientes.
            </p>
            <a href="/para-empresas#planos-detalhes" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a7a3c] mt-3 hover:underline">
              Ver planos <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* ── Já tem ativa/pendente ── */}
      {planoPago && temAtivaPendente && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8 flex items-start gap-3">
          <AlertCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Você já tem uma oferta ativa ou aguardando pagamento. Para publicar uma nova, aguarde a expiração ou o cancelamento da atual.
          </p>
        </div>
      )}

      {/* ── Formulário ── */}
      {planoPago && !temAtivaPendente && showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-[#ddd8cf] rounded-2xl p-6 mb-8 space-y-5">
          <h2 className="font-semibold text-[#1a1a1a] text-base mb-4">Criar nova oferta</h2>

          <div>
            <label className="block text-xs font-semibold text-[#6b6561] mb-1.5 uppercase tracking-wide">Título *</label>
            <input
              required maxLength={80}
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Ex: 30% de desconto no jantar para dois"
              className="w-full border border-[#ddd8cf] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a7a3c] focus:ring-1 focus:ring-[#1a7a3c]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6b6561] mb-1.5 uppercase tracking-wide">Descrição *</label>
            <textarea
              required rows={3}
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              placeholder="Descreva o que inclui a oferta, condições, etc."
              className="w-full border border-[#ddd8cf] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a7a3c] focus:ring-1 focus:ring-[#1a7a3c]/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6b6561] mb-1.5 uppercase tracking-wide">% de desconto</label>
              <input
                type="number" min={1} max={99}
                value={form.desconto_pct}
                onChange={e => setForm(f => ({ ...f, desconto_pct: e.target.value }))}
                placeholder="Ex: 30"
                className="w-full border border-[#ddd8cf] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a7a3c] focus:ring-1 focus:ring-[#1a7a3c]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b6561] mb-1.5 uppercase tracking-wide">Preço original (R$)</label>
              <input
                type="number" step="0.01" min={0}
                value={form.preco_original}
                onChange={e => setForm(f => ({ ...f, preco_original: e.target.value }))}
                placeholder="Ex: 180.00"
                className="w-full border border-[#ddd8cf] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a7a3c] focus:ring-1 focus:ring-[#1a7a3c]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b6561] mb-1.5 uppercase tracking-wide">Preço com oferta (R$)</label>
              <input
                type="number" step="0.01" min={0}
                value={form.preco_novo}
                onChange={e => setForm(f => ({ ...f, preco_novo: e.target.value }))}
                placeholder="Ex: 126.00"
                className="w-full border border-[#ddd8cf] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a7a3c] focus:ring-1 focus:ring-[#1a7a3c]/30"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-[#6b6561]">
              Custo: <strong className="text-[#1a1a1a]">R$ 20,00</strong> — você será redirecionado ao MercadoPago.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="text-sm text-[#6b6561] hover:text-[#1a1a1a] px-4 py-2 rounded-xl transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={creating}
                className="bg-[#1a7a3c] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#15633a] disabled:opacity-60 transition-colors">
                {creating ? "Processando…" : "Pagar R$ 20 e publicar"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Lista de ofertas ── */}
      {ofertas.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#ddd8cf] rounded-2xl">
          <Tag className="size-10 text-[#ddd8cf] mx-auto mb-4" />
          <p className="font-display text-lg text-[#1a1a1a] mb-1">Nenhuma oferta publicada ainda</p>
          <p className="text-sm text-[#6b6561]">
            {planoPago
              ? "Clique em \"Nova oferta\" para publicar sua primeira oferta na página inicial."
              : "Faça o upgrade do seu plano para começar a publicar ofertas."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="font-semibold text-[#1a1a1a] text-sm uppercase tracking-wide text-[#6b6561]">Histórico</h2>
          {ofertas.map((o) => (
            <div key={o.id} className="bg-white border border-[#ddd8cf] rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1a1a1a] truncate">{o.titulo}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#6b6561]">
                    {o.desconto_pct && (
                      <span className="bg-[#D4A437]/10 text-[#8c6117] font-semibold px-2 py-0.5 rounded-full">{o.desconto_pct}% OFF</span>
                    )}
                    {o.preco_original && o.preco_novo && (
                      <span>R$ {parseFloat(o.preco_original).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} → <strong className="text-[#1a7a3c]">R$ {parseFloat(o.preco_novo).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
                    )}
                    {o.expira_em && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {o.status === "ativa" ? `${o.dias_restantes} dias restantes` : new Date(o.expira_em).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={o.status} />
              </div>

              {o.status === "pendente" && o.mp_preference_id && (
                <div className="mt-4 pt-4 border-t border-[#ddd8cf]">
                  <p className="text-xs text-amber-700 mb-2">Pagamento pendente — clique abaixo para concluir:</p>
                  <a
                    href={`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${o.mp_preference_id}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a7a3c] hover:underline"
                  >
                    Concluir pagamento <ExternalLink className="size-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
