import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Store, Package, BarChart3, ArrowRight } from 'lucide-react';

const API = process.env.API_URL_INTERNAL || 'http://backend:8000/api';

export default async function PainelPage() {
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;

  if (!access) redirect('/painel/login');

  const res = await fetch(`${API}/usuarios/me/`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: 'no-store',
  });

  if (!res.ok) redirect('/painel/login');

  const user = await res.json();

  const CARDS = [
    {
      href: '/painel/meu-negocio',
      icon: Store,
      title: 'Meu Negócio',
      desc: 'Edite informações, SEO, espaço especial e redes sociais.',
      cta: 'Editar negócio',
    },
    {
      href: '/painel/produtos',
      icon: Package,
      title: 'Produtos',
      desc: 'Gerencie produtos, fotos e disponibilidade.',
      cta: 'Gerenciar produtos',
    },
    {
      href: '/painel/metricas',
      icon: BarChart3,
      title: 'Analytics',
      desc: 'Veja visualizações, conversões e origens de tráfego.',
      cta: 'Ver métricas',
    },
  ];

  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink">
          Bem-vindo, <span className="text-brand-green">{user.nome || user.email}</span>!
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Painel do comerciante · {user.role}
        </p>
      </header>

      {/* Cards de navegação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CARDS.map(({ href, icon: Icon, title, desc, cta }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-all flex flex-col gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors">
              <Icon className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-ink">{title}</h2>
              <p className="mt-1 text-sm text-ink-muted">{desc}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-brand-green group-hover:gap-2 transition-all">
              {cta}
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
