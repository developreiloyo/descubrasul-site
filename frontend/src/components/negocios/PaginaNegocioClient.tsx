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
  const cidade = negocio.cidade.charAt(0).toUpperCase() + negocio.cidade.slice(1);

  return (
    <div className="space-y-12">
      {/* Sobre */}
      {negocio.descricao && (
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
            <p
              className="text-base leading-relaxed"
              style={{ color: "#3f493f" }}
            >
              {negocio.descricao}
            </p>
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t" style={{ borderColor: "#becabc" }}>
              {negocio.categoria && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#e5eeff", color: "#2b3fd4" }}
                >
                  {negocio.categoria.nome}
                </span>
              )}
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "#eff4ff", color: "#00602a" }}
              >
                {cidade}, SC
              </span>
              {negocio.bairro && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#f3f4f6", color: "#6f7a6e" }}
                >
                  {negocio.bairro}
                </span>
              )}
            </div>
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
