'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, Settings } from 'lucide-react';

const NAV_LINKS = [
  { href: '/painel/meu-negocio', label: 'Meu Negócio' },
  { href: '/painel/produtos', label: 'Produtos' },
  { href: '/painel/metricas', label: 'Analytics' },
];

export function MerchantNavbar() {
  const pathname = usePathname();
  return (
    <nav className="bg-white sticky top-0 z-50 w-full border-b border-border h-16">
      <div className="flex justify-between items-center w-full px-4 md:px-8 h-full max-w-[1280px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/painel" className="shrink-0">
            <Image
              src="/logo.png"
              alt="DescubraSul"
              width={160}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors pb-1 ${
                    isActive
                      ? 'text-brand-green border-b-2 border-brand-green'
                      : 'text-ink-muted hover:text-brand-green'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-surface-muted rounded-lg text-ink-muted transition-all">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-surface-muted rounded-lg text-ink-muted transition-all">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-surface-hover border border-border overflow-hidden ml-1">
            <div className="w-full h-full bg-gradient-to-br from-brand-green to-brand-blue" />
          </div>
        </div>
      </div>
    </nav>
  );
}
