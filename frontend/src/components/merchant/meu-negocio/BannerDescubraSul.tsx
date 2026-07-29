'use client';

/**
 * Banner institucional DescubraSul — exibido no lugar da capa
 * para comerciantes do Plano Presença Sul (gratuito).
 *
 * Purely CSS/SVG — sem dependência de imagem externa.
 * Responsivo por natureza (aspect-ratio 16/9 + clamp).
 */
export function BannerDescubraSul() {
  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>

      {/* ── Fundo: gradiente verde-azul Sul Catarinense ─────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, #0b3d2e 0%, #1a7a3c 45%, #155f30 70%, #0f3460 100%)',
        }}
      />

      {/* ── Padrão de malha sutil ───────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 450"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern id="ds-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.4" />
          </pattern>
          <radialGradient id="ds-glow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#D4A437" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#D4A437" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Grade */}
        <rect width="800" height="450" fill="url(#ds-grid)" opacity="0.18" />

        {/* Halo dourado central */}
        <rect width="800" height="450" fill="url(#ds-glow)" />

        {/* Silhueta de montanhas — Serra Geral / Aparados */}
        <polygon
          points="0,450 0,260 80,200 160,240 260,130 360,180 420,100 500,150 580,110 680,170 800,120 800,450"
          fill="rgba(255,255,255,0.05)"
        />
        <polygon
          points="0,450 0,300 120,260 230,310 340,220 450,270 560,195 670,250 800,210 800,450"
          fill="rgba(255,255,255,0.04)"
        />

        {/* Ondas suaves no fundo — referência ao litoral Sul */}
        <path
          d="M0 390 Q200 360 400 385 Q600 410 800 380 L800 450 L0 450 Z"
          fill="rgba(255,255,255,0.06)"
        />
        <path
          d="M0 415 Q200 395 400 415 Q600 435 800 410 L800 450 L0 450 Z"
          fill="rgba(255,255,255,0.04)"
        />

        {/* Círculo decorativo direita */}
        <circle cx="700" cy="80" r="120" fill="rgba(255,255,255,0.04)" />
        <circle cx="700" cy="80" r="80" fill="rgba(255,255,255,0.04)" />
      </svg>

      {/* ── Conteúdo central ─────────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center">
        {/* Overline */}
        <p
          className="text-white/60 font-semibold tracking-[0.2em] uppercase"
          style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)' }}
        >
          Vitrine Digital do Sul Catarinense
        </p>

        {/* Logotipo tipográfico */}
        <h2
          className="font-extrabold text-white leading-none tracking-tight"
          style={{ fontSize: 'clamp(1.4rem, 6vw, 3rem)', letterSpacing: '-0.02em' }}
        >
          Descubra<span style={{ color: '#D4A437' }}>Sul</span>
        </h2>

        {/* Tagline */}
        <p
          className="text-white/50 font-medium"
          style={{ fontSize: 'clamp(0.6rem, 1.8vw, 0.8rem)' }}
        >
          O melhor de Criciúma, Tubarão, Araranguá e região
        </p>
      </div>

      {/* ── Badge Plano Presença Sul ─────────────────────────────── */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
        <span
          className="text-white font-semibold rounded-full border border-white/20"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            padding: 'clamp(2px, 0.5vw, 4px) clamp(6px, 1.5vw, 10px)',
            fontSize: 'clamp(0.55rem, 1.3vw, 0.7rem)',
            display: 'inline-block',
          }}
        >
          Plano Presença Sul
        </span>
      </div>

      {/* ── Linha dourada inferior ───────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, transparent, #D4A437, transparent)' }}
      />
    </div>
  );
}
