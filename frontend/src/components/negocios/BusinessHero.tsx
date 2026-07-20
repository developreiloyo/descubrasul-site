import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { mediaUrl, isAberto } from "@/lib/utils";
import { CategoriaIcon } from "@/lib/categoria-icons";
import type { Negocio } from "@/types";

interface Props {
  negocio: Negocio;
}

export function BusinessHero({ negocio }: Props) {
  const ogImageUrl = mediaUrl(negocio.og_image);
  const logoUrl = mediaUrl(negocio.logo);
  const bannerUrl = ogImageUrl;
  const aberto = isAberto(
    negocio.horario_abertura,
    negocio.horario_fechamento,
    negocio.dias_funcionamento
  );
  const cidade = negocio.cidade.charAt(0).toUpperCase() + negocio.cidade.slice(1);

  return (
    <section className="relative w-full h-72 md:h-[460px]" style={{ borderTop: "3px solid #1a7a3c" }}>
      {/* Banner */}
      <div className="absolute inset-0">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={negocio.alt_logo || negocio.nome}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: "#e5eeff" }}
          >
            <CategoriaIcon icone={negocio.categoria?.icone ?? ""} size={80} />
          </div>
        )}
      </div>

      {/* Gradient overlay — mais cinematográfico */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,28,48,0.35) 0%, rgba(11,28,48,0) 35%, rgba(11,28,48,0.1) 60%, rgba(11,28,48,0.9) 100%)",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-full relative flex flex-col justify-between py-5 md:py-8">
        {/* Top badges */}
        <div className="flex justify-between items-start">
          {negocio.verificado ? (
            <span
              className="backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <BadgeCheck className="w-3.5 h-3.5" style={{ color: "#4ade80" }} />
              <span className="hidden sm:inline">Verificado DescubraSul</span>
              <span className="sm:hidden">Verificado</span>
            </span>
          ) : (
            <span />
          )}

          {/* Status aberto/fechado */}
          <span
            className="backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2"
            style={{
              backgroundColor: aberto ? "rgba(26,122,60,0.85)" : "rgba(0,0,0,0.45)",
              color: "#fff",
              border: `1px solid ${aberto ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.15)"}`,
            }}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${aberto ? "animate-pulse" : ""}`}
              style={{ backgroundColor: aberto ? "#4ade80" : "#9ca3af" }}
            />
            {aberto ? "Aberto agora" : "Fechado"}
          </span>
        </div>

        {/* Bottom: frosted glass band com logo + nome + categoria */}
        <div className="flex items-end gap-4 md:gap-5">
          {/* Logo */}
          <div
            className="w-16 h-16 md:w-24 md:h-24 rounded-2xl border-2 border-white/30 bg-white overflow-hidden shadow-2xl flex-shrink-0"
            style={{ backdropFilter: "blur(4px)" }}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={negocio.nome}
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: "#eff4ff" }}
              >
                <CategoriaIcon icone={negocio.categoria?.icone ?? ""} size={36} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pb-0.5 text-white min-w-0">
            <h1 className="text-xl md:text-3xl font-extrabold leading-tight drop-shadow-sm truncate">
              {negocio.nome}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {negocio.categoria && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-sm"
                  style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#e0f2fe", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  {negocio.categoria.nome}
                </span>
              )}
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#d1fae5", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                {cidade}, SC
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
