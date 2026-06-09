import Link from "next/link";
import type { Categoria } from "@/types";

async function getCategorias(): Promise<Categoria[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://backend:8000/api"}/categorias/`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const categorias = await getCategorias();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          DescubraSul
        </h1>
        <p className="mt-4 text-lg text-ink/70 max-w-2xl mx-auto">
          Descubra os melhores negócios locais de Criciúma, Içara, Tubarão
          e toda a região Sul de Santa Catarina.
        </p>
      </section>

      {/* ─── Categorias ───────────────────────────────── */}
      <section className="py-8">
        <h2 className="text-2xl font-semibold mb-6">Explore por categoria</h2>
        {categorias.length === 0 ? (
          <p className="text-ink/50">Carregando categorias…</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categorias.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-ink/10 bg-white p-6 transition hover:border-primary hover:shadow-md"
              >
                <span className="text-3xl">{cat.icone}</span>
                <span className="text-sm font-medium text-center">
                  {cat.nome}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
