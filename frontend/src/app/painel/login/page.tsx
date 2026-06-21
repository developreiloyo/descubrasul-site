"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar]       = useState(false);
  const [erro, setErro]             = useState("");
  const [carregando, setCarregando] = useState(false);

  const formValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 1;

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!formValido || carregando) return;
    setErro("");
    setCarregando(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setErro("E-mail ou senha incorretos. Verifique e tente novamente.");
        return;
      }
      router.push("/painel");
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  const inputBase =
    "w-full px-3.5 py-2.5 rounded-lg border border-[#cbd5e1] bg-white " +
    "outline-none focus:ring-2 focus:ring-[#1a7a3c]/20 focus:border-[#1a7a3c] " +
    "transition-all text-[#0b1c30] placeholder:text-[#9ca3af] text-sm";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#f8f9ff" }}
    >
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="DescubraSul"
          width={180}
          height={48}
          className="h-12 w-auto object-contain"
          priority
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-card p-8">
        <h1 className="text-2xl font-bold text-center mb-1" style={{ color: "#0b1c30" }}>
          Entrar no DescubraSul
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: "#6f7a6e" }}>
          Acesse o painel do seu negócio
        </p>

        {/* Bloco de erro */}
        {erro && (
          <div
            className="flex items-start gap-2 rounded-lg border p-3 mb-5 text-sm"
            role="alert"
            style={{
              backgroundColor: "#ffdad6",
              borderColor: "rgba(186,26,26,0.2)",
              color: "#ba1a1a",
            }}
          >
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* E-mail */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-sm font-medium"
              style={{ color: "#3f493f" }}
            >
              E-mail
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputBase}
              placeholder="seu@email.com"
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="text-sm font-medium"
              style={{ color: "#3f493f" }}
            >
              Senha
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={mostrarSenha ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={`${inputBase} pr-11`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "#6f7a6e" }}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha
                  ? <EyeOff className="w-5 h-5" />
                  : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Lembrar de mim */}
          <label
            className="flex items-center gap-2.5 text-sm cursor-pointer select-none"
            style={{ color: "#3f493f" }}
          >
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
              className="w-4 h-4 rounded accent-[#1a7a3c]"
            />
            Lembrar de mim
          </label>

          {/* Botão */}
          <button
            type="submit"
            disabled={!formValido || carregando}
            className={[
              "w-full py-3 rounded-lg font-semibold transition-all",
              "active:scale-[0.98] flex items-center justify-center gap-2 text-sm",
              !formValido || carregando
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#1a7a3c] hover:bg-[#00602a] text-white",
            ].join(" ")}
          >
            {carregando && <Loader2 className="w-4 h-4 animate-spin" />}
            {carregando ? "Entrando..." : "Entrar"}
          </button>

          {/* Esqueceu senha */}
          <p className="text-center text-sm">
            <Link
              href="/painel/esqueci-senha"
              className="hover:underline transition-colors"
              style={{ color: "#2b3fd4" }}
            >
              Esqueceu sua senha?
            </Link>
          </p>
        </form>
      </div>

      {/* Link cadastro — fora do card */}
      <p className="mt-6 text-sm" style={{ color: "#6f7a6e" }}>
        Novo no DescubraSul?{" "}
        <Link
          href="/painel/cadastro"
          className="font-semibold hover:underline transition-colors"
          style={{ color: "#2b3fd4" }}
        >
          Cadastre seu negócio →
        </Link>
      </p>
    </div>
  );
}
