"use client";

import { AdSlot } from "@/components/ui/AdSlot";
import { HistoriaSection } from "@/components/negocios/HistoriaSection";
import { ProdutosSection } from "@/components/negocios/ProdutosSection";
import { EspacoEspecial } from "@/components/negocios/EspacoEspecial";
import type { Negocio, Produto } from "@/types";

interface Props {
  negocio: Negocio;
  produtos: Produto[];
  similares: Negocio[];
}

export function PaginaNegocioClient({ negocio, produtos }: Props) {
  const isPro = ["pro", "producao", "fundador"].includes(negocio.plano);
  const tags = negocio.palavras_chave
    ? negocio.palavras_chave
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-12">
      {/* Sobre */}
      {(negocio.descricao || tags.length > 0) && (
        <section>
          <h2
            className="text-2xl font-semibold mb-6 flex items-center gap-3"
            style={{ color: "#0b1c30" }}
          >
            Sobre {negocio.nome}
          </h2>
          <div
            className="bg-white rounded-xl p-6 shadow-sm border"
            style={{ borderColor: "#becabc" }}
          >
            {negocio.descricao && (
              <p
                className="text-base leading-relaxed mb-6"
                style={{ color: "#3f493f" }}
              >
                {negocio.descricao}
              </p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "#e5eeff", color: "#00602a" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Historia */}
      <HistoriaSection
        nome={negocio.nome}
        historia={negocio.historia}
        logo={negocio.logo}
        altLogo={negocio.alt_logo}
      />

      {/* Cardápio / Produtos */}
      <div id="produtos-destaque">
        <ProdutosSection negocio={negocio} produtos={produtos} />
      </div>

      {/* Ad slot — só planos gratuito/básico */}
      {!isPro && <AdSlot id="ad-slot-1" size="responsive" />}

      {/* Espaço Especial Pro+ */}
      <EspacoEspecial negocio={negocio} />
    </div>
  );
}
