'use client';

import { useEffect, useState } from 'react';
import { formatarPreco, mediaUrl } from '@/lib/utils';

interface Foto {
  id: number;
  foto: string;
  alt_texto: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: string | null;
  foto: string | null;
  disponivel: boolean;
  fotos: Foto[];
  ordem: number;
}

interface StatusPlano {
  plano_display: string;
  produtos_ativos: number;
  limite_produtos: number | null;
  pode_adicionar: boolean;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [plano, setPlano] = useState<StatusPlano | null>(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [foto, setFoto] = useState<File | null>(null);

  async function carregar() {
    const [resP, resS] = await Promise.all([
      fetch('/api/proxy/negocios/painel/produtos'),
      fetch('/api/proxy/negocios/painel/produtos/status_plano'),
    ]);
    if (resP.ok) {
      const d = await resP.json();
      setProdutos(d.results ?? d);
    }
    if (resS.ok) setPlano(await resS.json());
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criar() {
    setErro('');
    setSalvando(true);
    try {
      const fd = new FormData();
      fd.append('nome', nome);
      fd.append('descricao', descricao);
      if (preco) fd.append('preco', preco);
      if (foto) fd.append('foto', foto);

      const res = await fetch('/api/proxy/negocios/painel/produtos', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const msg = Object.values(d)[0];
        setErro(Array.isArray(msg) ? String(msg[0]) : String(msg ?? 'Erro ao salvar.'));
        return;
      }

      setNome('');
      setDescricao('');
      setPreco('');
      setFoto(null);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    await fetch(`/api/proxy/negocios/painel/produtos/${id}`, { method: 'DELETE' });
    await carregar();
  }

  async function confirmar(id: number) {
    await fetch(`/api/proxy/negocios/painel/produtos/${id}/confirmar_disponibilidade`, {
      method: 'POST',
    });
    await carregar();
  }

  async function destacar(id: number) {
    await fetch(`/api/proxy/negocios/painel/produtos/${id}/destacar/`, {
      method: 'POST',
    });
    await carregar();
  }

  async function adicionarFoto(produtoId: number, arquivo: File) {
    const fd = new FormData();
    fd.append('foto', arquivo);
    const res = await fetch(`/api/proxy/negocios/painel/produtos/${produtoId}/fotos`, {
      method: 'POST',
      body: fd,
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.detail || 'Erro ao adicionar foto.');
      return;
    }
    await carregar();
  }

  async function removerFoto(produtoId: number, fotoId: number) {
    await fetch(`/api/proxy/negocios/painel/produtos/${produtoId}/fotos/${fotoId}`, {
      method: 'DELETE',
    });
    await carregar();
  }

  const inputCls =
    'rounded-lg border border-ink/20 bg-white px-4 py-3 outline-none focus:border-primary';

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-ink">Meus Produtos</h1>
        {plano && (
          <p className="mt-2 text-ink-muted">
            {plano.plano_display} — {plano.produtos_ativos}
            {plano.limite_produtos !== null && ` de ${plano.limite_produtos}`} produto(s) ativo(s)
            {!plano.pode_adicionar && (
              <span className="ml-2 font-semibold text-secondary">
                Limite atingido — faça upgrade para adicionar mais
              </span>
            )}
          </p>
        )}
      </header>

      {/* Formulário */}
      <section className="rounded-xl border border-ink/10 bg-white shadow-card p-6 mb-8">
        <h2 className="mb-4 text-xl font-semibold">Adicionar produto</h2>
        <div className="flex flex-col gap-3">
          <input
            className={inputCls}
            placeholder="Nome do produto"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <textarea
            className={inputCls}
            placeholder="Descrição (natural, sem repetir palavras)"
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <input
            className={inputCls}
            type="number"
            step="0.01"
            placeholder="Preço (opcional)"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
          />
          <div>
            <label className="text-sm text-ink/60 mb-1 block">Foto principal</label>
            <input
              className={inputCls}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
            />
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <button
            onClick={criar}
            disabled={salvando || !nome || (plano !== null && !plano.pode_adicionar)}
            className="rounded-lg bg-brand-green px-4 py-3 font-semibold text-white transition hover:bg-brand-green-dark disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      </section>

      {/* Lista */}
      <section className="flex flex-col gap-4">
        {produtos.length === 0 && (
          <p className="text-ink-muted">Nenhum produto cadastrado ainda.</p>
        )}
        {produtos.map((p, index) => (
          <div
            key={p.id}
            className={`rounded-xl border bg-white shadow-card p-4 ${
              index === 0 ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-ink/10'
            }`}
          >
            {/* Badge destaque */}
            {index === 0 && (
              <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
                ⭐ Em destaque — aparece no carousel principal
              </div>
            )}

            {/* Linha principal */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {p.foto && (
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-ink/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl(p.foto) || ''}
                      alt={p.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold">
                    {p.nome}
                    {!p.disponivel && (
                      <span className="ml-2 text-sm text-red-500">(oculto)</span>
                    )}
                  </p>
                  {p.preco && (
                    <p className="text-sm text-primary">{formatarPreco(p.preco)}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0 justify-end">
                {index !== 0 && (
                  <button
                    onClick={() => destacar(p.id)}
                    className="rounded-lg border border-amber-400 px-3 py-1 text-sm text-amber-600 hover:bg-amber-400 hover:text-white transition"
                  >
                    ⭐ Destacar
                  </button>
                )}
                <button
                  onClick={() => confirmar(p.id)}
                  className="rounded-lg border border-brand-green px-3 py-1 text-sm text-brand-green hover:bg-brand-green hover:text-white transition"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => excluir(p.id)}
                  className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-500 hover:bg-red-500 hover:text-white transition"
                >
                  Excluir
                </button>
              </div>
            </div>

            {/* Fotos extras — até 3 total */}
            <div className="mt-3 border-t border-ink/10 pt-3">
              <p className="text-xs text-ink/50 mb-2">
                Fotos adicionais ({p.fotos?.length || 0}/3) — aparecem no carousel da vitrina
              </p>
              <div className="flex gap-2 flex-wrap">
                {p.fotos?.map((f) => (
                  <div
                    key={f.id}
                    className="relative size-16 overflow-hidden rounded-lg border border-ink/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl(f.foto) || ''}
                      alt={f.alt_texto || p.nome}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removerFoto(p.id, f.id)}
                      className="absolute top-0.5 right-0.5 rounded-full bg-red-500 text-white text-xs size-5 flex items-center justify-center hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {(p.fotos?.length || 0) < 3 && (
                  <label className="size-16 rounded-lg border-2 border-dashed border-ink/20 flex flex-col items-center justify-center cursor-pointer hover:border-brand-green transition">
                    <span className="text-2xl text-ink/30 leading-none">+</span>
                    <span className="text-[10px] text-ink/30 mt-0.5">foto</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) adicionarFoto(p.id, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
