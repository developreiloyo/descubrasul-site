"use client";

import { useState } from "react";
import Link from "next/link";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit() {
    if (!email) return;
    setErro("");
    setCarregando(true);
    try {
      const res = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setErro("Erro ao enviar e-mail. Tente novamente.");
        return;
      }
      setEnviado(true);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  if (enviado) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <p className="text-4xl">📬</p>
          <h1 className="mt-4 text-2xl font-bold text-green-800">
            E-mail enviado!
          </h1>
          <p className="mt-2 text-green-700">
            Se esse e-mail estiver cadastrado, você receberá as instruções
            em breve. Verifique também a caixa de spam.
          </p>
          <Link
            href="/painel/login"
            className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Voltar ao login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="text-center text-3xl font-bold text-primary">
        Esqueceu sua senha?
      </h1>
      <p className="mt-2 text-center text-ink/60">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <input
          type="email"
          placeholder="Seu e-mail cadastrado"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="rounded-lg border border-ink/20 bg-white px-4 py-3 outline-none focus:border-primary"
        />

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button
          onClick={handleSubmit}
          disabled={carregando || !email}
          className="rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {carregando ? "Enviando..." : "Enviar link de redefinição"}
        </button>

        <p className="text-center text-sm text-ink/60">
          Lembrou a senha?{" "}
          <Link href="/painel/login" className="font-semibold text-primary">
            Voltar ao login
          </Link>
        </p>
      </div>
    </main>
  );
}
