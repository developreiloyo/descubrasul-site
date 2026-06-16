"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between gap-4">

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
        <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-sec">
          <Link href="/"            className="hover:text-ink transition-colors">Início</Link>
          <Link href="/#categorias" className="hover:text-ink transition-colors">Categorias</Link>
          <Link href="/marketplace" className="hover:text-ink transition-colors">Marketplace</Link>
          <Link href="/food"        className="hover:text-ink transition-colors">Food</Link>
          <Link href="/para-empresas" className="hover:text-ink transition-colors">Para Empresas</Link>
        </div>

        {/* Ações desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/painel/login"
            className="text-sm font-semibold text-primary px-4 py-2.5 rounded-full hover:bg-primary/5 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/painel/cadastro"
            className="text-sm font-semibold text-white badge-gold px-5 py-2.5 rounded-full shadow-sm hover:brightness-105 transition-all"
          >
            Cadastre seu negócio
          </Link>
        </div>

        {/* Hamburger mobile */}
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
        <div className="lg:hidden bg-white border-t border-black/5 px-4 py-4 flex flex-col gap-1">
          <Link href="/"              onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-sec hover:text-ink border-b border-black/5">Início</Link>
          <Link href="/#categorias"  onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-sec hover:text-ink border-b border-black/5">Categorias</Link>
          <Link href="/marketplace"  onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-sec hover:text-ink border-b border-black/5">Marketplace</Link>
          <Link href="/food"         onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-sec hover:text-ink border-b border-black/5">Food</Link>
          <Link href="/para-empresas" onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-sec hover:text-ink border-b border-black/5">Para Empresas</Link>
          <Link href="/painel/login" onClick={() => setOpen(false)} className="mt-3 block text-center py-3 text-sm font-semibold text-primary">Entrar</Link>
          <Link href="/painel/cadastro" onClick={() => setOpen(false)} className="block text-center py-3 badge-gold text-white text-sm font-semibold rounded-full">Cadastre seu negócio</Link>
        </div>
      )}
    </nav>
  );
}
