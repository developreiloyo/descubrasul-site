'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, Package, BarChart3, LayoutDashboard } from 'lucide-react';

const ITEMS = [
  { href: '/painel', label: 'Painel', icon: LayoutDashboard },
  { href: '/painel/meu-negocio', label: 'Negócio', icon: Store },
  { href: '/painel/produtos', label: 'Produtos', icon: Package },
  { href: '/painel/metricas', label: 'Analytics', icon: BarChart3 },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border h-16 z-50 flex items-center justify-around px-2">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href || (href !== '/painel' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 ${
              isActive ? 'text-brand-green' : 'text-ink-muted'
            }`}
          >
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
