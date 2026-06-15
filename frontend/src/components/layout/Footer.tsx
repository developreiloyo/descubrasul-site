import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
        {/* Marca */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-2xl font-black tracking-tight">
            <span className="text-white">Descubra</span>
            <span className="text-secondary">Sul</span>
          </Link>
          <p className="text-sm text-white/70 leading-relaxed max-w-xs">
            Conectando você ao melhor do Sul de Santa Catarina: empresas,
            gastronomia, serviços e muito mais.
          </p>
          <div className="flex gap-3 mt-1">
            <a href="#" aria-label="Instagram" className="px-3 py-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-xs font-medium">IG</a>
            <a href="#" aria-label="Facebook" className="px-3 py-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-xs font-medium">FB</a>
            <a href="#" aria-label="LinkedIn" className="px-3 py-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-xs font-medium">IN</a>
          </div>
        </div>

        {/* Descubra */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">Descubra</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><Link href="/" className="hover:text-white transition-colors">Início</Link></li>
            <li><Link href="/#categorias" className="hover:text-white transition-colors">Categorias</Link></li>
            <li><Link href="/food" className="hover:text-white transition-colors">DescubraSul Food</Link></li>
            <li><Link href="/busca" className="hover:text-white transition-colors">Buscar negócios</Link></li>
          </ul>
        </div>

        {/* Para Empresas */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">Para Empresas</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><Link href="/para-empresas" className="hover:text-white transition-colors">Por que anunciar?</Link></li>
            <li><Link href="/painel/cadastro" className="hover:text-white transition-colors">Cadastre seu negócio</Link></li>
            <li><Link href="/painel/login" className="hover:text-white transition-colors">Painel do anunciante</Link></li>
            <li><Link href="/planos" className="hover:text-white transition-colors">Planos e preços</Link></li>
          </ul>
        </div>

        {/* Suporte */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">Suporte</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><Link href="/contato" className="hover:text-white transition-colors">Fale Conosco</Link></li>
            <li><Link href="/faq" className="hover:text-white transition-colors">Perguntas Frequentes</Link></li>
            <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
            <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade & LGPD</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-white/40">
          <span>© {year} DescubraSul. Todos os direitos reservados.</span>
          <span>Sul de Santa Catarina, Brasil.</span>
        </div>
      </div>
    </footer>
  );
}
