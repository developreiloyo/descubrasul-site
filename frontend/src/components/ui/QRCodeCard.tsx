"use client";

import QRCode from "react-qr-code";

interface Props {
  slug: string;
  cidade: string;
  categoriaSlug: string;
  nomeNegocio: string;
}

const SITE = "https://descubrasul.com";

function slugify(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
}

export function QRCodeCard({ slug, cidade, categoriaSlug, nomeNegocio }: Props) {
  const url = `${SITE}/negocios/${slugify(cidade)}/${categoriaSlug}/${slug}`;

  function baixarPNG() {
    const svg = document.getElementById("qr-negocio");
    if (!svg) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.fillRect(0, 0, 400, 400);
      ctx?.drawImage(img, 0, 0, 400, 400);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `qrcode-${slug}.png`;
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
  }

  function baixarSVG() {
    const svg = document.getElementById("qr-negocio");
    if (!svg) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qrcode-${slug}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-6">
      <h2 className="text-lg font-bold text-ink">QR Code do seu negócio</h2>
      <p className="mt-1 text-sm text-ink/50">
        Imprima e cole na vitrine, balcão ou cardápio. Clientes escaneiam e caem direto na sua página.
      </p>

      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="shrink-0 rounded-xl border border-ink/10 bg-white p-4 shadow-sm">
          <QRCode id="qr-negocio" value={url} size={160} />
        </div>

        <div className="flex flex-col gap-3 sm:pt-1">
          <div>
            <p className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1">Link da sua página</p>
            <p className="text-xs text-primary break-all">{url}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={baixarPNG}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Baixar PNG
            </button>
            <button
              onClick={baixarSVG}
              className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
            >
              Baixar SVG
            </button>
          </div>

          <p className="text-xs text-ink/40">
            PNG para impressão comum · SVG para gráficos e banners (escala sem perder qualidade)
          </p>

          <p className="text-xs text-ink/50 italic">
            Dica: compartilhe também o link direto no WhatsApp, Stories e cartão de visita.
          </p>
        </div>
      </div>
    </section>
  );
}
