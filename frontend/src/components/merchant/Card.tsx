import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function Card({ title, icon: Icon, children, className = '' }: CardProps) {
  return (
    <section className={`bg-white rounded-xl shadow-card p-6 ${className}`}>
      {title && (
        <header className="flex items-center gap-2 mb-5">
          {Icon && <Icon className="w-5 h-5 text-brand-green" strokeWidth={2} />}
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
        </header>
      )}
      {children}
    </section>
  );
}
