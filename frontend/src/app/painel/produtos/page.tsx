"use client";

import { useEffect, useState } from "react";
import { formatarPreco } from "@/lib/utils";

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: string | null;
  foto: string | null;
  disponivel: boolean;
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
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  async function carregar() {
    const [resP, resS] = await Promise.all([
      fetch("/api/proxy/negocios/painel/produtos"),
      fetch("/api/proxy/negocios/painel/produtos/status_plano"),
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
    setErro("");
    setSalvando(true);
    try {
      const fd = new FormData();
      fd.append("nome", nome);
      fd.append("descricao", descricao);
      if (preco) fd.append("preco", preco);
      if (foto) fd.append("foto", foto);

      const res = await fetch("/api/proxy/negocios/painel/produtos", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const msg = Object.values(d)[0];
        setErro(Array.isArray(msg) ? String(msg[0]) : String(msg ?? "Erro ao salvar."));
        return;
      }

      setNome(""); setDescricao(""); setPreco(""); setFoto(null);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    await fetch(`/api/proxy/negocios/painel/produtos/${id}`, { method: "DELETE" });
    await carregar();
  }

  async function confirmar(id: number) {
    await fetch(`/api/proxy/negocios/painel/produtos/${id}/confirmar_disponibilidade`, {
      method: "POST",
    });
    await carregar();
  }

  const inputCls =
    "rounded-lg border border-ink/20 bg-white px-4 py-3 outline-none focus:border-primary";

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Meus Produtos</h1>

      {plano && (
        <p className="mt-2 text-ink/60">
          {plano.plano_display} — {plano.produtos_ativos}
          {plano.limite_produtos !== null && ` de ${plano.limite_produtos}`} produto(s) ativo(s)
          {!plano.pode_adicionar && (
            <span className="ml-2 font-semibold text-secondary">
              Limite atingido — faca upgrade para adicionar mais
            </span>
          )}
        </p>
      )}

      {/* ─── Formulario ───────────────────────────── */}
      <section className="mt-8 rounded-xl border border-ink/10 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Adicionar produto</h2>
        <div className="flex flex-col gap-3">
          <input className={inputCls} placeholder="Nome do produto"
            value={nome} onChange={(e) => setNome(e.target.value)} />
          <textarea className={inputCls} placeholder="Descricao (natural, sem repetir palavras)"
            rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <input className={inputCls} type="number" step="0.01" placeholder="Preco (opcional)"
            value={preco} onChange={(e) => setPreco(e.target.value)} />
          <input className={inputCls} type="file" accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)} />

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <button
            onClick={criar}
            disabled={salvando || !nome || (plano !== null && !plano.pode_adicionar)}
            className="rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      </section>

      {/* ─── Lista ────────────────────────────────── */}
      <section className="mt-8 flex flex-col gap-3">
        {produtos.length === 0 && (
          <p className="text-ink/50">Nenhum produto cadastrado ainda.</p>
        )}
        {produtos.map((p) => (
          <div key={p.id}
            className="flex items-center justify-between rounded-xl border border-ink/10 bg-white p-4">
            <div>
              <p className="font-semibold">
                {p.nome}
                {!p.disponivel && (
                  <span className="ml-2 text-sm text-red-500">(oculto)</span>
                )}
              </p>
              {p.preco && <p className="text-sm text-primary">{formatarPreco(p.preco)}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => confirmar(p.id)}
                className="rounded-lg border border-primary px-3 py-1 text-sm text-primary hover:bg-primary hover:text-white">
                Confirmar disponivel
              </button>
              <button onClick={() => excluir(p.id)}
                className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-500 hover:bg-red-500 hover:text-white">
                Excluir
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
