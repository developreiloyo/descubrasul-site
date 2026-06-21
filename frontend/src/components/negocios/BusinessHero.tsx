import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { mediaUrl, isAberto } from "@/lib/utils";
import type { Negocio } from "@/types";

interface Props {
  negocio: Negocio;
}

export function BusinessHero({ negocio }: Props) {
  const logoUrl = mediaUrl(negocio.logo);
  const aberto = isAberto(
    negocio.horario_abertura,
    negocio.horario_fechamento,
    negocio.dias_funcionamento
  );

  return (
    <section
      className="relative w-full h-80 md:h-[480px]"
      style={{ borderTop: "3px solid #DC2626" }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={negocio.alt_logo || negocio.nome}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-9xl"
            style={{ backgroundColor: "#e5eeff" }}
          >
            {negocio.categoria?.icone ?? "🏪"}
          </div>
        )}
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-full relative flex flex-col justify-between py-6 md:py-10">
        {/* Top badges */}
        <div className="flex justify-between items-start">
          {negocio.verificado ? (
            <span
              className="bg-white/90 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs font-bold flex items-center gap-2"
              style={{ color: "#0b1c30" }}
            >
              <BadgeCheck className="w-4 h-4" style={{ color: "#00602a" }} />
              <span className="hidden sm:inline">Verificado DescubraSul</span>
              <span className="sm:hidden">Verificado</span>
            </span>
          ) : (
            <span />
          )}
          <span
            className="ml-auto bg-white/90 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs font-bold flex items-center gap-2"
            style={{ color: "#0b1c30" }}
          >
            <span
              className={`w-2 h-2 rounded-full ${aberto ? "animate-pulse" : ""}`}
              style={{ backgroundColor: aberto ? "#22c55e" : "#9ca3af" }}
            />
            {aberto ? "ABERTO AGORA" : "FECHADO"}
          </span>
        </div>

        {/* Bottom: logo circle + nome */}
        <div className="flex items-end gap-4 md:gap-6">
          {/* Logo circle */}
          <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-2 md:border-4 border-white bg-white overflow-hidden shadow-xl flex-shrink-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={negocio.nome}
                width={128}
                height={128}
                className="w-full h-full object-contain"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-4xl md:text-5xl"
                style={{ backgroundColor: "#eff4ff" }}
              >
                {negocio.categoria?.icone ?? "🏪"}
              </div>
            )}
          </div>

          <div className="pb-1 md:pb-2 text-white">
            <h1 className="text-2xl md:text-4xl font-extrabold mb-1 drop-shadow leading-tight">
              {negocio.nome}
            </h1>
            {negocio.descricao && (
              <p className="text-sm md:text-lg opacity-90 line-clamp-2 md:line-clamp-none">
                {negocio.descricao}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
