"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [form, setForm] = useState({
    negocio_nome: "",
    categoria_slug: "",
    cidade: "",
    email: "",
    password: "",
    nome: "",
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
  const completo =
    Object.values(form).every((v) => v.trim() !== "") &&
    aceitouTermos &&
    (passwordConfirm === "" || form.password === passwordConfirm);

  async function handleSubmit() {
    setErro("");

    if (form.password !== passwordConfirm) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    try {
      const payload = {
        ...form,
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        lgpd_consent: aceitouTermos,
      };
      const res = await fetch("/api/proxy/usuarios/cadastro/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setErro("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
          return;
        }
        const primeiro = Object.values(data)[0];
        if (Array.isArray(primeiro)) {
          setErro(String(primeiro[0]));
        } else if (typeof primeiro === "string") {
          setErro(primeiro);
        } else {
          setErro("Erro no cadastro. Verifique os dados.");
        }
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
        <p className={`mt-2 ${labelCls}`}>Dados do negócio ou perfil profissional</p>

        {/* Nome do negócio */}
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

        {/* Categoria */}
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

        {/* Cidade */}
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

        {/* E-mail */}
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

        {/* Senha */}
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className={labelCls}>
            Senha <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              required
              type={showPassword ? "text" : "password"}
              className={`${inputCls} pr-12`}
              placeholder="Senha (minimo 8 caracteres)"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/60"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Repetir senha */}
        <div className="flex flex-col gap-1">
          <label htmlFor="password_confirm" className={labelCls}>
            Repetir senha <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password_confirm"
              required
              type={showPasswordConfirm ? "text" : "password"}
              className={`${inputCls} pr-12`}
              placeholder="Repita a senha"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPasswordConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/60"
              aria-label={showPasswordConfirm ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordConfirm !== "" && form.password !== passwordConfirm && (
            <p className="text-xs text-red-500">As senhas não coincidem.</p>
          )}
        </div>

        {/* Nome do responsável */}
        <div className="flex flex-col gap-1">
          <label htmlFor="nome" className={labelCls}>
            Nome do responsável <span className="text-red-500">*</span>
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

        {/* WhatsApp */}
        <div className="flex flex-col gap-1">
          <label htmlFor="whatsapp" className={labelCls}>
            WhatsApp <span className="text-red-500">*</span>
          </label>
          <input
            id="whatsapp"
            required
            type="tel"
            className={inputCls}
            placeholder="(48) 99999-0000"
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
