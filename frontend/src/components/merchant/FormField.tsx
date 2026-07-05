import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, htmlFor, hint, required, children, className = '' }: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-muted">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <span className="text-xs text-ink-subtle">{hint}</span>}
    </div>
  );
}

export const inputClass =
  'w-full px-3.5 py-2.5 border border-border rounded-lg text-sm ' +
  'focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green ' +
  'outline-none transition-all bg-white';
