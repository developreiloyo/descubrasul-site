"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit() {
    setErro("");
    setCarregando(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setErro("E-mail ou senha incorretos.");
        return;
      }
      router.push("/painel");
    } catch {
      setErro("Erro de conexao. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="text-center text-3xl font-bold text-primary">
        Entrar no DescubraSul
      </h1>
      <p className="mt-2 text-center text-ink/60">
        Acesse o painel do seu negocio
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-ink/20 bg-white px-4 py-3 outline-none focus:border-primary"
        />
        <input
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="rounded-lg border border-ink/20 bg-white px-4 py-3 outline-none focus:border-primary"
        />

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button
          onClick={handleSubmit}
          disabled={carregando || !email || !password}
          className="rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-sm text-ink/60">
          Ainda nao tem conta?{" "}
          <Link href="/painel/cadastro" className="font-semibold text-primary">
            Cadastre seu negocio
          </Link>
        </p>
      </div>
    </main>
  );
}
