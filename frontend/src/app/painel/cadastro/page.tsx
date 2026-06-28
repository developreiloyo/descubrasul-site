"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Categoria } from "@/types";

export default function CadastroPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    password: "",
    negocio_nome: "",
    categoria_slug: "",
    cidade: "",
    whatsapp: "",
  });
  useEffect(() => {
    fetch("/api/proxy/categorias/?ordering=ordem&limit=100")
      .then((r) => r.json())
      .then((d) => setCategorias(d.results ?? d ?? []))
      .catch((err) => console.error("Erro ao carregar categorias:", err));
  }, []);
  function set(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const completo = Object.values(form).every((v) => v.trim() !== "") && aceitouTermos;
  async function handleSubmit() {
    setErro("");
    setCarregando(true);
    try {
      const res = await fetch("/api/proxy/usuarios/cadastro/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const primeiro = Object.values(data)[0];
        setErro(Array.isArray(primeiro) ? String(primeiro[0]) : "Erro no cadastro. Verifique os dados.");
        return;
      }
      // Auto-login apos cadastro
      const login = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      router.push(login.ok ? "/painel" : "/painel/login");
    } catch {
      setErro("Erro de conexao. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }
  const inputCls =
    "rounded-lg border border-ink/20 bg-white px-4 py-3 outline-none focus:border-primary";
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-center text-3xl font-bold text-primary">
        Cadastre seu negocio
      </h1>
      <p className="mt-2 text-center text-ink/60">
        Gratis para comecar — apareca no Google hoje mesmo
      </p>
      <div className="mt-8 flex flex-col gap-4">
        <p className="text-sm font-semibold text-ink/50">SEUS DADOS</p>
        <input className={inputCls} placeholder="Seu nome completo"
          value={form.nome} onChange={(e) => set("nome", e.target.value)} />
        <input className={inputCls} type="email" placeholder="Seu e-mail"
          value={form.email} onChange={(e) => set("email", e.target.value)} />
        <input className={inputCls} type="password" placeholder="Senha (minimo 8 caracteres)"
          value={form.password} onChange={(e) => set("password", e.target.value)} />
        <p className="mt-2 text-sm font-semibold text-ink/50">SEU NEGOCIO</p>
        <input className={inputCls} placeholder="Nome do negocio"
          value={form.negocio_nome} onChange={(e) => set("negocio_nome", e.target.value)} />
        <select className={inputCls} value={form.categoria_slug}
          onChange={(e) => set("categoria_slug", e.target.value)}>
          <option value="">Escolha a categoria</option>
          {categorias.map((c) => (
            <option key={c.slug} value={c.slug}>{c.icone} {c.nome}</option>
          ))}
        </select>
        <input className={inputCls} placeholder="Cidade (ex: Criciuma)"
          value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
        <input className={inputCls} placeholder="WhatsApp (ex: 48999990000)"
          value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <label className="flex items-start gap-3 text-sm text-ink/70">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-primary"
            checked={aceitouTermos}
            onChange={(e) => setAceitouTermos(e.target.checked)}
          />
          <span>
            Li e aceito os{" "}
            <Link href="/termos" className="font-semibold text-primary underline">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" className="font-semibold text-primary underline">
              Política de Privacidade
            </Link>
            . Concordo com o tratamento dos meus dados conforme a LGPD.
          </span>
        </label>
        <button
          onClick={handleSubmit}
          disabled={carregando || !completo}
          className="rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {carregando ? "Cadastrando..." : "Criar minha vitrine gratis"}
        </button>
        <p className="text-center text-sm text-ink/60">
          Ja tem conta?{" "}
          <Link href="/painel/login" className="font-semibold text-primary">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}