import Link from 'next/link';
import { Eye, CheckCircle2 } from 'lucide-react';
import { Card } from '../Card';

interface Props {
  status: string;
  plano: string;
  slug?: string;
  cidade?: string;
  categoriaSlug?: string;
}

const PLANO_LABELS: Record<string, string> = {
  gratuito: 'Plano Gratuito',
  basico: 'Plano Básico',
  pro: 'Plano Pro',
  producao: 'Plano Produção',
  fundador: 'Plano Fundador',
};

export function StatusCard({ status, plano, slug, cidade, categoriaSlug }: Props) {
  const publicUrl =
    slug && cidade && categoriaSlug
      ? `/negocios/${cidade.toLowerCase()}/${categoriaSlug}/${slug}`
      : null;

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-ink-muted">Status:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-bg text-brand-green-dark">
            <CheckCircle2 className="w-3 h-3" />
            {status === 'publicado' ? 'Publicado' : 'Rascunho'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-ink-muted">Plano atual:</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-blue text-white">
            {PLANO_LABELS[plano] ?? plano}
          </span>
        </div>

        {publicUrl && (
          <Link
            href={publicUrl}
            target="_blank"
            className="mt-1 flex items-center justify-center gap-2 border-2 border-[#2b3fd4] text-[#2b3fd4] hover:bg-[#2b3fd4] hover:text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Eye className="w-4 h-4" />
            Visualizar página pública
          </Link>
        )}
      </div>
    </Card>
  );
}
