"use client";

import { useState } from "react";
import { CheckCircle2, Search, Star, MapPin, ExternalLink, Loader2 } from "lucide-react";

interface Candidato {
  place_id: string;
  nome: string;
  endereco: string;
  rating: number | null;
  total: number | null;
}

interface Props {
  placeIdAtual: string;
  onSave: (place_id: string) => Promise<void>;
}

export function GooglePlacesCard({ placeIdAtual, onSave }: Props) {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [query, setQuery]           = useState("");
  const [buscando, setBuscando]     = useState(false);
  const [salvando, setSalvando]     = useState(false);
  const [erro, setErro]             = useState("");
  const [selecionado, setSelecionado] = useState<string>(placeIdAtual);
  const [salvo, setSalvo]           = useState(!!placeIdAtual);
  const [mostrarBusca, setMostrarBusca] = useState(false);

  async function buscar() {
    setErro("");
    setBuscando(true);
    setCandidatos([]);
    try {
      const res = await fetch("/api/proxy/negocios/painel/buscar-google/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.detail ?? "Erro ao buscar."); return; }
      setCandidatos(data);
      if (data.length === 0) setErro("Nenhum resultado. Tente com outro nome.");
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setBuscando(false);
    }
  }

  async function confirmar(place_id: string) {
    setSalvando(true);
    setErro("");
    try {
      await onSave(place_id);
      setSelecionado(place_id);
      setSalvo(true);
      setMostrarBusca(false);
      setCandidatos([]);
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function desconectar() {
    setSalvando(true);
    try {
      await onSave("");
      setSelecionado("");
      setSalvo(false);
      setMostrarBusca(false);
      setCandidatos([]);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#becabc] p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <h2 className="font-semibold text-[#0b1c30] text-sm">Google Business Profile</h2>
        {salvo && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
            <CheckCircle2 className="size-3.5" /> Conectado
          </span>
        )}
      </div>
      <p className="text-[12px] text-[#6b6561] mb-5">
        Conecte seu perfil do Google para exibir avaliações reais na sua vitrine.
      </p>

      {/* Estado: conectado */}
      {salvo && !mostrarBusca && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setMostrarBusca(true); setCandidatos([]); }}
            className="text-xs font-semibold text-[#00602a] border border-[#00602a]/30 rounded-xl px-4 py-2 hover:bg-[#eff4ff] transition-colors"
          >
            Alterar perfil
          </button>
          <button
            onClick={desconectar}
            disabled={salvando}
            className="text-xs text-[#6b6561] hover:text-red-600 transition-colors"
          >
            Desconectar
          </button>
        </div>
      )}

      {/* Estado: não conectado ou alterando */}
      {(!salvo || mostrarBusca) && (
        <div className="space-y-4">
          {/* Busca */}
          <div className="flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && buscar()}
              placeholder="Nome do negócio (ou deixe vazio para busca automática)"
              className="flex-1 border border-[#becabc] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00602a] focus:ring-1 focus:ring-[#00602a]/30"
            />
            <button
              onClick={buscar}
              disabled={buscando}
              className="bg-[#00602a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#1a7a3c] disabled:opacity-60 transition-colors"
            >
              {buscando ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              Buscar
            </button>
          </div>

          {erro && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{erro}</p>
          )}

          {/* Candidatos */}
          {candidatos.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[#6b6561] uppercase tracking-wide">
                Selecione seu negócio:
              </p>
              {candidatos.map((c) => (
                <div
                  key={c.place_id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    selecionado === c.place_id
                      ? "border-[#00602a] bg-[#eff4ff]"
                      : "border-[#becabc] hover:border-[#00602a]/50"
                  }`}
                  onClick={() => setSelecionado(c.place_id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0b1c30] text-sm truncate">{c.nome}</p>
                      <p className="text-[11px] text-[#6b6561] mt-0.5 flex items-center gap-1">
                        <MapPin className="size-3 shrink-0" /> {c.endereco}
                      </p>
                    </div>
                    {c.rating && (
                      <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-[#0b1c30]">
                        <Star className="size-3.5 text-[#fbbc04] fill-[#fbbc04]" />
                        {c.rating.toFixed(1)}
                        <span className="font-normal text-[#6b6561]">({c.total?.toLocaleString("pt-BR")})</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <button
                disabled={!selecionado || salvando}
                onClick={() => confirmar(selecionado)}
                className="w-full bg-[#00602a] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#1a7a3c] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {salvando ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Confirmar este negócio
              </button>
            </div>
          )}

          <p className="text-[10.5px] text-[#6b6561]/70">
            As avaliações são buscadas diretamente do Google e atualizadas a cada 6 horas.{" "}
            <a href="https://business.google.com" target="_blank" rel="noopener noreferrer"
              className="text-[#00602a] hover:underline inline-flex items-center gap-0.5">
              Não tem perfil? Criar no Google <ExternalLink className="size-3" />
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
