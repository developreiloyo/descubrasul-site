'use client';
import { Camera, Lock } from 'lucide-react';
import { Card } from '../Card';
import { BannerDescubraSul } from './BannerDescubraSul';

interface Props {
  plano: string;
  logoUrl?: string;
  capaUrl?: string;
  onLogoChange: (file: File) => void;
  onCapaChange: (file: File) => void;
}

export function LogoCapaCard({ plano, logoUrl, capaUrl, onLogoChange, onCapaChange }: Props) {
  const isGratuito = plano === 'gratuito';

  return (
    <Card title="Logo e capa">
      <div className="flex flex-col items-center gap-4">
        {/* ── Logo (sempre editável) ──────────────────────── */}
        <label className="cursor-pointer">
          <div className="w-32 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-[#1a7a3c] transition-colors">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Camera className="w-8 h-8 text-ink-subtle" />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onLogoChange(e.target.files[0])}
          />
          <p className="text-xs text-ink-subtle text-center mt-2">Logo (120×120)</p>
        </label>

        {/* ── Capa ─────────────────────────────────────────── */}
        {isGratuito ? (
          /* Presença Sul — banner institucional, sem opção de troca */
          <div className="w-full">
            <BannerDescubraSul />
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-ink-subtle" />
              <p className="text-xs text-ink-subtle text-center">
                Banner DescubraSul — disponível em{' '}
                <a
                  href="/para-empresas#planos-detalhes"
                  className="underline hover:text-[#1a7a3c] transition-colors"
                >
                  Conexão Sul ou Destaque Sul
                </a>
                .
              </p>
            </div>
          </div>
        ) : (
          /* Conexão Sul / Destaque Sul — capa personalizável */
          <label className="cursor-pointer w-full">
            <div className="w-full aspect-[16/9] rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-[#1a7a3c] transition-colors">
              {capaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={capaUrl} alt="Capa" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 px-4">
                  <Camera className="w-8 h-8 text-ink-subtle" />
                  <span className="text-xs text-ink-subtle text-center">
                    Arraste a capa aqui ou clique para selecionar
                  </span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onCapaChange(e.target.files[0])}
            />
            <p className="text-xs text-ink-subtle text-center mt-2">Capa (sugestão 16:9)</p>
          </label>
        )}
      </div>
    </Card>
  );
}
