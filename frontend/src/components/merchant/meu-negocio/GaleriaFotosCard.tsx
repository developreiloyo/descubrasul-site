'use client';

import { useEffect, useRef, useState } from 'react';
import { Images, Lock, Plus, Trash2, Loader2 } from 'lucide-react';
import { Card } from '../Card';

interface FotoGaleria {
  id: number;
  foto: string;
  alt_texto: string;
  ordem: number;
}

interface RespostaGaleria {
  fotos: FotoGaleria[];
  limite: number;
  total: number;
  pode_adicionar: boolean;
}

interface Props {
  plano: string;
  isPro: boolean;
}

export function GaleriaFotosCard({ isPro }: Props) {
  const [fotos, setFotos] = useState<FotoGaleria[]>([]);
  const [limite, setLimite] = useState(10);
  const [total, setTotal] = useState(0);
  const [podeAdicionar, setPodeAdicionar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [fazendoUpload, setFazendoUpload] = useState(false);
  const [erro, setErro] = useState('');
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function carregarFotos() {
    setCarregando(true);
    setErro('');
    try {
      const res = await fetch('/api/proxy/negocios/painel/galeria/');
      if (!res.ok) throw new Error('Erro ao carregar galeria.');
      const data: RespostaGaleria = await res.json();
      setFotos(data.fotos ?? []);
      setLimite(data.limite ?? 10);
      setTotal(data.total ?? 0);
      setPodeAdicionar(data.pode_adicionar ?? false);
    } catch {
      setErro('Não foi possível carregar as fotos da galeria.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (isPro) {
      carregarFotos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reseta o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';

    setFazendoUpload(true);
    setErro('');
    try {
      const fd = new FormData();
      fd.append('foto', file);
      const res = await fetch('/api/proxy/negocios/painel/galeria/', {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const primeiro = Object.values(data)[0];
        const msg = Array.isArray(primeiro) ? String(primeiro[0]) : 'Erro ao enviar foto.';
        setErro(msg);
        return;
      }
      await carregarFotos();
    } catch {
      setErro('Erro de conexão ao enviar foto.');
    } finally {
      setFazendoUpload(false);
    }
  }

  async function handleDeletar(id: number) {
    setErro('');
    try {
      const res = await fetch(`/api/proxy/negocios/painel/galeria/${id}/`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao deletar foto.');
      setConfirmandoId(null);
      await carregarFotos();
    } catch {
      setErro('Não foi possível remover a foto.');
    }
  }

  const limiteAtingido = total >= limite;

  // ── Lock state para planos gratuito/básico ───────────────────────
  if (!isPro) {
    return (
      <Card icon={Images} title="Galeria de Fotos">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/20 bg-ink/[0.02] px-6 py-8 text-center">
          <Lock className="size-8 text-ink/20" />
          <p className="text-sm font-medium text-ink/50">
            Galeria de fotos disponível nos planos Conexão Sul e Destaque Sul.
          </p>
          <a
            href="/para-empresas#planos-detalhes"
            className="rounded-lg bg-[#1a7a3c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#155f30]"
          >
            Ver planos
          </a>
        </div>
      </Card>
    );
  }

  // ── Subtítulo com contador de uso ────────────────────────────────
  const subtitulo = limiteAtingido
    ? `${total} / ${limite} fotos — limite atingido`
    : `${total} / ${limite} fotos utilizadas`;

  return (
    <Card>
      {/* Header personalizado com contador */}
      <div className="flex items-center justify-between -mt-1 mb-5">
        <div className="flex items-center gap-2">
          <Images className="w-5 h-5 text-[#1a7a3c]" strokeWidth={2} />
          <div>
            <h2 className="text-lg font-semibold text-ink leading-tight">Galeria de Fotos</h2>
            <p className="text-xs text-ink-muted leading-tight">{subtitulo}</p>
          </div>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!podeAdicionar || fazendoUpload || limiteAtingido}
          className="flex items-center gap-1.5 rounded-lg bg-[#1a7a3c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#155f30] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {fazendoUpload ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {fazendoUpload ? 'Enviando...' : 'Adicionar foto'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Barra de progresso */}
      <div className="mb-5">
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min((total / limite) * 100, 100)}%`,
              backgroundColor: limiteAtingido ? '#ef4444' : '#1a7a3c',
            }}
          />
        </div>
        {limiteAtingido && (
          <p className="mt-1.5 text-xs text-red-600 font-medium">
            Limite de {limite} fotos atingido. Remova uma foto para adicionar outra.
          </p>
        )}
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <p className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
          {erro}
        </p>
      )}

      {/* Estado de carregamento inicial */}
      {carregando && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
        </div>
      )}

      {/* Estado vazio */}
      {!carregando && fotos.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-10 text-center">
          <Images className="w-8 h-8 text-slate-300" />
          <p className="text-sm text-ink-muted">
            Nenhuma foto na galeria ainda.
            <br />
            Clique em &quot;Adicionar foto&quot; para começar.
          </p>
        </div>
      )}

      {/* Grid de fotos */}
      {!carregando && fotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {fotos.map((foto) => (
            <div key={foto.id} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.foto}
                alt={foto.alt_texto || 'Foto da galeria'}
                className="w-full h-full object-cover"
              />

              {/* Overlay de confirmação */}
              {confirmandoId === foto.id ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75 p-2">
                  <p className="text-white text-xs font-medium text-center leading-tight">
                    Remover esta foto?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeletar(foto.id)}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                    >
                      Remover
                    </button>
                    <button
                      onClick={() => setConfirmandoId(null)}
                      className="rounded-md bg-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* Botão de lixeira — sempre visível (desktop hover + mobile touch) */
                <div className="absolute top-1.5 right-1.5">
                  <button
                    onClick={() => setConfirmandoId(foto.id)}
                    title="Remover foto"
                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/50 text-white hover:bg-red-600 transition shadow-md opacity-60 hover:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
