import { Clock, MapPin } from "lucide-react";
import type { Negocio } from "@/types";

const DIAS_MAP: Record<string, string> = {
  seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui",
  sex: "Sex", sab: "Sáb", dom: "Dom",
};

interface Props {
  negocio: Negocio;
}

export function OfrecemosSection({ negocio }: Props) {
  const temHorario = negocio.horario_abertura && negocio.horario_fechamento;
  const temDias    = negocio.dias_funcionamento?.length > 0;
  const temArea    = negocio.localizacao?.area_servico;

  if (!temHorario && !temDias && !temArea) return null;

  const abreAs  = negocio.horario_abertura?.slice(0, 5);
  const fechaAs = negocio.horario_fechamento?.slice(0, 5);
  const diasFmt = negocio.dias_funcionamento
    ?.map((d) => DIAS_MAP[d] ?? d)
    .join(" · ");

  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">{negocio.categoria?.icone}</span>
        <h2 className="text-xl font-bold text-ink">O que oferecemos</h2>
      </div>

      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary w-fit">
          {negocio.categoria?.icone} {negocio.categoria?.nome}
          {negocio.bairro && ` · ${negocio.bairro}`}
        </div>

        {temArea && (
          <div className="flex items-start gap-2 text-sm text-ink/70">
            <MapPin className="mt-0.5 size-4 shrink-0 text-ink/30" />
            <span>{temArea}</span>
          </div>
        )}

        {(temHorario || temDias) && (
          <div className="flex items-start gap-2 text-sm text-ink/70">
            <Clock className="mt-0.5 size-4 shrink-0 text-ink/30" />
            <div className="flex flex-col gap-0.5">
              {temHorario && (
                <span>
                  Atendimento: <strong className="text-ink">{abreAs}</strong>
                  {" às "}
                  <strong className="text-ink">{fechaAs}</strong>
                </span>
              )}
              {temDias && (
                <span className="text-xs text-ink/50">{diasFmt}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
