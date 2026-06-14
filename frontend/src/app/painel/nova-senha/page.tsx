"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function NovaSenhaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const uid   = searchParams.get("uid")   ?? "";
  const token = searchParams.get("token") ?? "";

  const [password, setPassword]     = useState("");
  const [confirmar, setConfirmar]   = useState("");
  const [sucesso, setSucesso]       = useState(false);
  const [erro, setErro]             = useState("");
  const [carregando, setCarregando] = useState(false);

  const linkInvalido = !uid || !token;

  async function handleSubmit() {
    setErro("");

    if (password.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data.detail || "Link inválido ou expirado.");
        return;
      }

      setSucesso(true);
      setTimeout(() => router.push("/painel/login"), 3000);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  if (linkInvalido) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-4xl">🔗</p>
          <h1 className="mt-4 text-2xl font-bold text-red-800">
            Link inválido
          </h1>
          <p className="mt-2 text-red-700">
            Este link de redefinição está incompleto ou foi corrompido.
          </p>
          <Link
            href="/painel/esqueci-senha"
            className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Solicitar novo link
          </Link>
        </div>
      </main>
    );
  }

  if (sucesso) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <p className="text-4xl">✅</p>
          <h1 className="mt-4 text-2xl font-bold text-green-800">
            Senha redefinida!
          </h1>
          <p className="mt-2 text-green-700">
            Sua senha foi alterada com sucesso. Redirecionando para o
            login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="text-center text-3xl font-bold text-primary">
        Redefinir senha
      </h1>
      <p className="mt-2 text-center text-ink/60">
        Escolha uma nova senha para sua conta.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <input
          type="password"
          placeholder="Nova senha (mín. 8 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-ink/20 bg-white px-4 py-3 outline-none focus:border-primary"
        />
        <input
          type="password"
          placeholder="Confirmar nova senha"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="rounded-lg border border-ink/20 bg-white px-4 py-3 outline-none focus:border-primary"
        />

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button
          onClick={handleSubmit}
          disabled={carregando || !password || !confirmar}
          className="rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {carregando ? "Salvando..." : "Salvar nova senha"}
        </button>
      </div>
    </main>
  );
}

export default function NovaSenhaPage() {
  return (
    <Suspense>
      <NovaSenhaForm />
    </Suspense>
  );
}
