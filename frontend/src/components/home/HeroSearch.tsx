"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

const CIDADES = ["Criciúma","Içara","Araranguá","Tubarão","Forquilhinha","Morro da Fumaça"];

function slugify(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g,"-");
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
      className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-2.5 mt-8 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto lg:mx-0"
    >
      <label className="flex items-center gap-2.5 flex-1 px-3.5 py-3 rounded-xl hover:bg-cream transition-colors cursor-text">
        <Search className="size-5 text-sec shrink-0" strokeWidth={1.5} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Produto, loja ou serviço..."
          className="w-full text-sm outline-none placeholder:text-sec bg-transparent text-ink"
        />
      </label>
      <div className="hidden sm:block w-px bg-black/10 my-2" />
      <label className="flex items-center gap-2.5 sm:w-52 px-3.5 py-3 rounded-xl hover:bg-cream transition-colors">
        <MapPin className="size-5 text-sec shrink-0" strokeWidth={1.5} />
        <select
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="w-full text-sm outline-none text-ink bg-transparent cursor-pointer"
        >
          <option value="">Em qual cidade?</option>
          {CIDADES.map((c) => (
            <option key={c} value={slugify(c)}>{c}</option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="badge-gold text-white font-semibold text-sm rounded-xl px-7 py-3.5 flex items-center justify-center gap-2 hover:brightness-105 transition-all"
      >
        <Search className="size-4" />
        Buscar
      </button>
    </form>
  );
}
