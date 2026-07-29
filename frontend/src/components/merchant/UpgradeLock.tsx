import { Lock } from 'lucide-react';

interface Props {
  mensagem: string;
  className?: string;
}

export function UpgradeLock({ mensagem, className = '' }: Props) {
  return (
    <div className={`flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/20 bg-ink/[0.02] px-6 py-6 text-center ${className}`}>
      <Lock className="size-7 text-ink/20" />
      <p className="text-sm font-medium text-ink/50">{mensagem}</p>
      <a
        href="/para-empresas#planos-detalhes"
        className="rounded-lg bg-[#1a7a3c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#155f30]"
      >
        Fazer Upgrade
      </a>
    </div>
  );
}
