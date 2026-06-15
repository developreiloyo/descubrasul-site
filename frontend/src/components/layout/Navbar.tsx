"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-ink/5 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt="DescubraSul"
            width={220}
            height={56}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>

        {/* Links desktop */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-ink/60">
          <Link href="/" className="hover:text-ink transition-colors">Início</Link>
          <Link href="/#categorias" className="hover:text-ink transition-colors">Categorias</Link>
          <Link href="/food" className="hover:text-ink transition-colors">DescubraSul Food</Link>
          <Link href="/para-empresas" className="hover:text-ink transition-colors">Para Empresas</Link>
        </div>

        {/* Ações desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/painel/login"
            className="text-sm font-semibold text-secondary hover:text-secondary/80 px-3 py-2 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/painel/cadastro"
            className="text-sm font-semibold bg-secondary text-white px-5 py-2.5 rounded-full hover:bg-secondary/90 transition-colors shadow-sm"
          >
            Cadastre seu negócio
          </Link>
        </div>

        {/* Botão menu mobile */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 text-primary"
          aria-label="Menu"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="lg:hidden bg-white border-t border-ink/5 px-4 py-4 flex flex-col gap-1 shadow-lg">
          <Link href="/" onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-ink/70 hover:text-ink border-b border-ink/5">Início</Link>
          <Link href="/#categorias" onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-ink/70 hover:text-ink border-b border-ink/5">Categorias</Link>
          <Link href="/food" onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-ink/70 hover:text-ink border-b border-ink/5">DescubraSul Food</Link>
          <Link href="/para-empresas" onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-ink/70 hover:text-ink border-b border-ink/5">Para Empresas</Link>
          <Link href="/painel/login" onClick={() => setOpen(false)} className="mt-3 block w-full text-center py-3 text-sm font-semibold text-secondary">Entrar</Link>
          <Link href="/painel/cadastro" onClick={() => setOpen(false)} className="block w-full text-center py-3 bg-secondary text-white text-sm font-semibold rounded-full">Cadastre seu negócio</Link>
        </div>
      )}
    </nav>
  );
}
