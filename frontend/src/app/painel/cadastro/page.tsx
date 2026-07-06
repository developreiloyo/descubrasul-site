"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Categoria } from "@/types";
import { maskPhone } from "@/lib/masks";

interface Cidade {
  slug: string;
  nome: string;
}

export default function CadastroPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
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

    fetch("/api/proxy/cidades/")
      .then((r) => r.json())
      .then((d) => setCidades(Array.isArray(d) ? d : []))
      .catch(() => {});
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
      const payload = { ...form, whatsapp: form.whatsapp.replace(/\D/g, "") };
      const res = await fetch("/api/proxy/usuarios/cadastro/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const primeiro = Object.values(data)[0];
        setErro(Array.isArray(primeiro) ? String(primeiro[0]) : "Erro no cadastro. Verifique os dados.");
        return;
      }
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
    "rounded-lg border border-ink/20 bg-white px-4 py-3 outline-none focus:border-primary w-full";
  const labelCls = "text-xs font-semibold text-ink/50 uppercase tracking-wide";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-center text-3xl font-bold text-primary">
        Cadastre seu negocio
      </h1>
      <p className="mt-2 text-center text-ink/60">
        Gratis para comecar — apareca no Google hoje mesmo
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <p className={`mt-2 ${labelCls}`}>SEUS DADOS</p>

        <div className="flex flex-col gap-1">
          <label htmlFor="nome" className={labelCls}>
            Nome completo <span className="text-red-500">*</span>
          </label>
          <input
            id="nome"
            required
            className={inputCls}
            placeholder="Seu nome completo"
            value={form.nome}
            onChange={(e) => set("nome", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className={labelCls}>
            E-mail <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            required
            type="email"
            className={inputCls}
            placeholder="Seu e-mail"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className={labelCls}>
            Senha <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            required
            type="password"
            className={inputCls}
            placeholder="Senha (minimo 8 caracteres)"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
          />
        </div>

        <p className={`mt-2 ${labelCls}`}>SEU NEGOCIO</p>

        <div className="flex flex-col gap-1">
          <label htmlFor="negocio_nome" className={labelCls}>
            Nome do negócio <span className="text-red-500">*</span>
          </label>
          <input
            id="negocio_nome"
            required
            className={inputCls}
            placeholder="Nome do negocio"
            value={form.negocio_nome}
            onChange={(e) => set("negocio_nome", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="categoria_slug" className={labelCls}>
            Categoria <span className="text-red-500">*</span>
          </label>
          <select
            id="categoria_slug"
            required
            className={inputCls}
            value={form.categoria_slug}
            onChange={(e) => set("categoria_slug", e.target.value)}
          >
            <option value="">Escolha a categoria</option>
            {categorias.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cidade" className={labelCls}>
            Cidade <span className="text-red-500">*</span>
          </label>
          <select
            id="cidade"
            required
            className={inputCls}
            value={form.cidade}
            onChange={(e) => set("cidade", e.target.value)}
          >
            <option value="">Selecione a cidade</option>
            {cidades.map((c) => (
              <option key={c.slug} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="whatsapp" className={labelCls}>
            WhatsApp <span className="text-red-500">*</span>
          </label>
          <input
            id="whatsapp"
            required
            type="tel"
            className={inputCls}
            placeholder="+55 (48) 99999-0000"
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", maskPhone(e.target.value))}
          />
        </div>

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
