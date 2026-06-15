"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

const CIDADES = [
  "Criciúma",
  "Içara",
  "Araranguá",
  "Tubarão",
  "Forquilhinha",
  "Morro da Fumaça",
];

function slugificar(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-");
}

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const [cidade, setCidade] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (cidade) params.set("cidade", cidade);
    router.push(`/busca?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="mt-10 bg-white rounded-2xl shadow-2xl p-3 flex flex-col lg:flex-row gap-2 max-w-3xl mx-auto"
    >
      <div className="relative flex-grow">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-ink/40 pointer-events-none"
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="O que você procura?"
          className="w-full pl-12 pr-4 py-3.5 rounded-full border border-ink/10 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-ink text-sm"
        />
      </div>
      <div className="relative lg:w-64">
        <MapPin
          className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-ink/40 pointer-events-none"
          strokeWidth={1.5}
        />
        <select
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="w-full pl-12 pr-8 py-3.5 rounded-full border border-ink/10 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-ink text-sm appearance-none bg-white cursor-pointer"
        >
          <option value="">Qual cidade?</option>
          {CIDADES.map((c) => (
            <option key={c} value={slugificar(c)}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 bg-secondary text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-secondary/90 transition-colors whitespace-nowrap"
      >
        <Search className="size-4" strokeWidth={2} />
        Buscar
      </button>
    </form>
  );
}
