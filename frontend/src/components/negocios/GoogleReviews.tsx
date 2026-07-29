import Image from "next/image";
import { Star, ExternalLink } from "lucide-react";
import type { GoogleReviewData } from "@/types";

function Stars({ nota, size = 14 }: { nota: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={n <= Math.round(nota) ? "text-[#fbbc04] fill-[#fbbc04]" : "text-[#ddd] fill-[#ddd]"}
        />
      ))}
    </span>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-[11px] text-[#6b6561]">
      <span className="w-3 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#e8e8e8] rounded-full overflow-hidden">
        <div className="h-full bg-[#fbbc04] rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function GoogleReviews({ data, nomeNegocio }: { data: GoogleReviewData; nomeNegocio: string }) {
  const ratingInt = Math.round(data.rating);

  return (
    <section aria-labelledby="google-reviews-title" className="mt-8">
      <h2 id="google-reviews-title" className="font-semibold text-[#0b1c30] text-base mb-4 flex items-center gap-2">
        Avaliações no Google
        <span className="inline-flex items-center gap-1 text-xs font-normal text-[#6b6561] bg-[#f1f3f4] rounded-full px-2 py-0.5">
          {/* Google G icon */}
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </span>
      </h2>

      {/* Rating summary */}
      <div className="bg-white border border-[#becabc] rounded-2xl p-5 mb-4">
        <div className="flex items-start gap-6">
          {/* Score grande */}
          <div className="text-center shrink-0">
            <p className="font-display text-[3rem] font-bold text-[#0b1c30] leading-none">{data.rating.toFixed(1)}</p>
            <Stars nota={data.rating} size={16} />
            <p className="text-[11px] text-[#6b6561] mt-1">{data.total.toLocaleString("pt-BR")} avaliações</p>
          </div>

          {/* Barras por nota */}
          <div className="flex-1 space-y-1.5 pt-1">
            {[5, 4, 3, 2, 1].map((n) => {
              const approx = n === ratingInt
                ? Math.round(data.total * 0.55)
                : n === ratingInt - 1
                ? Math.round(data.total * 0.25)
                : Math.round(data.total * 0.05);
              return <RatingBar key={n} label={String(n)} count={approx} total={data.total} />;
            })}
          </div>
        </div>

        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 pt-4 border-t border-[#eff4ff] flex items-center gap-1.5 text-[12px] font-semibold text-[#00602a] hover:text-[#1a7a3c] transition-colors"
          >
            Ver todas as avaliações no Google <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>

      {/* Cards de reviews */}
      {data.reviews.length > 0 && (
        <div className="space-y-3">
          {data.reviews.slice(0, 3).map((rev, i) => (
            <div key={i} className="bg-white border border-[#becabc] rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2.5">
                {rev.foto ? (
                  <Image
                    src={rev.foto}
                    alt={rev.autor}
                    width={36}
                    height={36}
                    className="rounded-full object-cover shrink-0"
                    loading="lazy"
                    sizes="36px"
                  />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-[#eff4ff] text-[#00602a] font-bold text-sm flex items-center justify-center shrink-0">
                    {rev.autor.charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-[#0b1c30] text-sm truncate">{rev.autor}</p>
                  <div className="flex items-center gap-2">
                    <Stars nota={rev.nota} size={11} />
                    <span className="text-[10px] text-[#6b6561]">{rev.tempo}</span>
                  </div>
                </div>
              </div>
              {rev.texto && (
                <p className="text-[12.5px] text-[#3f493f] leading-[1.6] line-clamp-4">{rev.texto}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-[#6b6561]/60 mt-3 text-center">
        Avaliações fornecidas pelo Google Maps · {nomeNegocio}
      </p>
    </section>
  );
}
