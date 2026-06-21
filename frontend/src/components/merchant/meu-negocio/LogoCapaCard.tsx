'use client';
import { Camera, ImageIcon } from 'lucide-react';
import { Card } from '../Card';

interface Props {
  logoUrl?: string;
  capaUrl?: string;
  onLogoChange: (file: File) => void;
  onCapaChange: (file: File) => void;
}

export function LogoCapaCard({ logoUrl, capaUrl, onLogoChange, onCapaChange }: Props) {
  return (
    <Card title="Logo e capa">
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <label className="cursor-pointer">
          <div className="w-32 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-brand-green transition-colors">
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

        {/* Capa */}
        <label className="cursor-pointer w-full">
          <div className="w-full aspect-[16/9] rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-brand-green transition-colors">
            {capaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={capaUrl} alt="Capa" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 px-4">
                <ImageIcon className="w-8 h-8 text-ink-subtle" />
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
          <p className="text-xs text-ink-subtle text-center mt-2">Capa (Sugestão 16:9)</p>
        </label>
      </div>
    </Card>
  );
}
