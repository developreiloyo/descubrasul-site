import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

const API = process.env.API_URL_INTERNAL || "http://backend:8000/api";

export default async function PainelPage() {
  const cookieStore = await cookies();
  const access = cookieStore.get("access_token")?.value;

  if (!access) redirect("/painel/login");

  const res = await fetch(`${API}/usuarios/me/`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });

  if (!res.ok) redirect("/painel/login");

  const user = await res.json();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Painel</h1>
      <p className="mt-2 text-ink/70">
        Bem-vindo, <strong>{user.nome || user.email}</strong>!
      </p>
      <p className="mt-1 text-sm text-ink/50">
        Role: {user.role} — autenticacao httpOnly funcionando ✓
      </p>
      <Link
        href="/painel/produtos"
        className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
      >
        <div className="mt-6 flex gap-3">
        <Link
          href="/painel/produtos"
          className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
        >
          Gerenciar produtos
        </Link>
        <Link
          href="/painel/meu-negocio"
          className="inline-block rounded-lg border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary hover:text-white"
        >
          Editar meu negocio
        </Link>
      </div>
      </Link>
    </main>
  );
}
