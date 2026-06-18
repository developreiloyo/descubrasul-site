import type { Negocio } from "@/types";

const PLANOS_PRO = ["pro", "producao", "fundador"] as const;

interface Props {
  negocio: Negocio;
}

function DestaqueBanner({ titulo, conteudo, badge, ctaTexto, ctaLink }: {
  titulo?: string; conteudo?: string; badge?: string;
  ctaTexto?: string; ctaLink?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {badge && (
        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
          {badge}
        </span>
      )}
      {titulo && <h3 className="text-xl font-bold text-white">{titulo}</h3>}
      {conteudo && <p className="text-sm leading-relaxed text-white/80">{conteudo}</p>}
      {ctaTexto && ctaLink && (
        <a
          href={ctaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 w-fit rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-white/90"
        >
          {ctaTexto}
        </a>
      )}
    </div>
  );
}

function DestaqueOferta({ badge, titulo, desconto, conteudo, ctaTexto, ctaLink }: {
  badge?: string; titulo?: string; desconto?: string;
  conteudo?: string; ctaTexto?: string; ctaLink?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {desconto && (
        <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/20 text-center">
          <span className="text-3xl font-black text-white">{desconto}</span>
          <span className="text-xs font-semibold text-white/70">OFF</span>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {badge && (
          <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
            {badge}
          </span>
        )}
        {titulo && <h3 className="text-xl font-bold text-white">{titulo}</h3>}
        {conteudo && <p className="text-sm text-white/80">{conteudo}</p>}
        {ctaTexto && ctaLink && (
          <a
            href={ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 w-fit rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-white/90"
          >
            {ctaTexto}
          </a>
        )}
      </div>
    </div>
  );
}

function DestaqueCupom({ badge, titulo, codigo, conteudo }: {
  badge?: string; titulo?: string; codigo?: string; conteudo?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {badge && (
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
          {badge}
        </span>
      )}
      {titulo && <h3 className="text-xl font-bold text-white">{titulo}</h3>}
      {conteudo && <p className="text-sm text-white/80">{conteudo}</p>}
      {codigo && (
        <div className="mt-1 rounded-xl border-2 border-dashed border-white/40 bg-white/10 px-6 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Código</p>
          <p className="mt-1 text-2xl font-black tracking-widest text-white">{codigo}</p>
        </div>
      )}
    </div>
  );
}

function DestaqueVideo({ html }: { html: string }) {
  return (
    <div
      className="overflow-hidden rounded-xl [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function EspacoEspecial({ negocio }: Props) {
  const isPro = PLANOS_PRO.includes(negocio.plano as typeof PLANOS_PRO[number]);
  if (!isPro) return null;

  const espaco  = negocio.espaco_especial;
  const primeiroVideo = negocio.videos?.[0];

  if (!espaco && !primeiroVideo) return null;

  const renderConteudo = () => {
    if (espaco?.tipo === "video" || (!espaco && primeiroVideo)) {
      const html = primeiroVideo?.oembed_html;
      if (!html) return null;
      return <DestaqueVideo html={html} />;
    }

    if (!espaco) return null;

    switch (espaco.tipo) {
      case "texto":
        return (
          <DestaqueBanner
            titulo={espaco.titulo}
            conteudo={espaco.conteudo}
            badge={espaco.badge}
            ctaTexto={espaco.cta_texto}
            ctaLink={espaco.cta_link}
          />
        );
      case "oferta":
        return (
          <DestaqueOferta
            badge={espaco.badge}
            titulo={espaco.titulo}
            desconto={espaco.desconto}
            conteudo={espaco.conteudo}
            ctaTexto={espaco.cta_texto}
            ctaLink={espaco.cta_link}
          />
        );
      case "cupom":
        return (
          <DestaqueCupom
            badge={espaco.badge}
            titulo={espaco.titulo}
            codigo={espaco.codigo}
            conteudo={espaco.conteudo}
          />
        );
      default:
        return null;
    }
  };

  const conteudo = renderConteudo();
  if (!conteudo) return null;

  return (
    <section
      aria-label="Destaque especial"
      className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-teal-700 p-6 shadow-md"
    >
      {conteudo}
    </section>
  );
}
