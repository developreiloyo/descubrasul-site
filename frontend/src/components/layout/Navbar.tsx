import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-primary shrink-0">
          Descubra<span className="text-amber-500">Sul</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-ink/70">
          <Link href="/" className="hover:text-primary transition-colors">Início</Link>
          <Link href="/#categorias" className="hover:text-primary transition-colors">Categorias</Link>
          <Link href="/para-empresas" className="hover:text-primary transition-colors">Para Empresas</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Link
            href="/painel/login"
            className="hidden sm:inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-ink/70 hover:text-primary transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/painel/cadastro"
            className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            Cadastre seu negócio
          </Link>
        </div>
      </div>
    </header>
  );
}
