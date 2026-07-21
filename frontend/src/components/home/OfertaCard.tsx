import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { mediaUrl, linkWhatsApp } from "@/lib/utils";
import type { Oferta } from "@/types";

function slugify(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
}

function fmt(value: string) {
  return parseFloat(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function OfertaCard({ oferta }: { oferta: Oferta }) {
  const logoUrl  = mediaUrl(oferta.negocio_logo);
  const imgUrl   = mediaUrl(oferta.imagem);
  const cidSlug  = slugify(oferta.negocio_cidade);
  const negLink  = `/negocios/${cidSlug}/${oferta.negocio_cat_slug}/${oferta.negocio_slug}`;
  const waLink   = linkWhatsApp(oferta.negocio_whatsapp, `Olá! Vi a oferta "${oferta.titulo}" no DescubraSul e tenho interesse.`);

  const pct = oferta.desconto_pct
    ?? (oferta.preco_original && oferta.preco_novo
        ? Math.round((1 - parseFloat(oferta.preco_novo) / parseFloat(oferta.preco_original)) * 100)
        : null);

  return (
    <article className="bg-white border border-[#ddd8cf] rounded-[20px] overflow-hidden card-hover flex flex-col">

      {/* ── Header ── */}
      <div className="relative h-[168px] overflow-hidden flex-shrink-0">

        {/* Imagem do produto ou gradiente verde */}
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={oferta.titulo}
            fill
            className="object-cover"
            sizes="300px"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(145deg, #0f2914 0%, #1a7a3c 50%, #26a855 100%)",
            }}
          />
        )}

        {/* Overlay vinheta inferior */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
          }}
        />

        {/* Círculos decorativos (apenas sem imagem) */}
        {!imgUrl && (
          <svg viewBox="0 0 300 168" fill="none" aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none">
            <circle cx="280" cy="-15" r="130" stroke="white" strokeWidth="1" opacity="0.12" />
            <circle cx="260" cy="35"  r="80"  stroke="white" strokeWidth="1" opacity="0.09" />
            <circle cx="238" cy="72"  r="44"  stroke="white" strokeWidth="1" opacity="0.07" />
          </svg>
        )}

        {/* Badge % OFF */}
        {pct !== null && (
          <div className="absolute top-3.5 right-3.5 z-10 w-[58px] h-[58px] rounded-[10px] bg-[#D4A437] flex flex-col items-center justify-center leading-none">
            <span className="font-display text-[19px] font-bold text-[#111]">{pct}%</span>
            <span className="text-[8.5px] font-semibold tracking-[0.12em] text-[#111]/60 mt-0.5">OFF</span>
          </div>
        )}

        {/* Logo do negócio */}
        <div className="absolute bottom-[22px] left-4 w-12 h-12 rounded-[10px] border border-white/35 overflow-hidden flex items-center justify-center"
             style={{ background: "rgba(255,255,255,0.18)" }}>
          {logoUrl ? (
            <Image src={logoUrl} alt={oferta.negocio_nome} fill className="object-cover" sizes="48px" />
          ) : (
            <span className="font-display text-[22px] font-bold text-white">{oferta.negocio_nome.charAt(0)}</span>
          )}
        </div>

        {/* Nome do negócio */}
        <p className="absolute bottom-3 left-[72px] right-16 font-display text-[15.5px] font-bold text-white leading-snug drop-shadow truncate">
          {oferta.negocio_nome}
        </p>
      </div>

      {/* ── Body ── */}
      <div className="px-4 pt-3.5 pb-4 flex flex-col flex-1">

        {/* Chip categoria · cidade */}
        <span className="inline-flex items-center self-start rounded-full bg-[#1a7a3c]/10 px-2.5 py-1 text-[10px] font-medium text-[#1a7a3c] mb-3">
          {oferta.negocio_categoria} · {oferta.negocio_cidade}
        </span>

        {/* Descrição */}
        <p className="text-[12.5px] text-[#6b6561] leading-[1.55] line-clamp-2 mb-4">
          {oferta.descricao}
        </p>

        {/* Preços */}
        <div className="mb-1">
          {oferta.preco_original && (
            <p className="text-[11.5px] text-[#6b6561]/55 line-through">
              de {fmt(oferta.preco_original)}
            </p>
          )}
          {oferta.preco_novo && (
            <p className="font-display text-[28px] font-bold text-[#1a7a3c] leading-none">
              {fmt(oferta.preco_novo)}
            </p>
          )}
          {!oferta.preco_novo && !oferta.preco_original && (
            <p className="font-display text-[18px] font-bold text-[#1a7a3c]">{oferta.titulo}</p>
          )}
        </div>

        {/* Validade */}
        <p className="text-[10px] text-[#6b6561]/60 mb-3">
          Válido até {new Date(oferta.expira_em).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        {/* Divisor */}
        <div className="border-t border-[#ddd8cf] mb-3" />

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <span className="inline-flex items-center rounded-full bg-[#fff7db] px-2.5 py-1.5 text-[10.5px] font-semibold text-[#8c6117]">
            {oferta.dias_restantes === 0 ? "Último dia" : `${oferta.dias_restantes} dias restantes`}
          </span>
          <Link href={negLink} className="text-[12px] font-semibold text-[#1a7a3c] hover:text-[#D4A437] transition-colors flex items-center gap-1">
            Ver oferta <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
