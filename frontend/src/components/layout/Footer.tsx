import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Mail, MapPin } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#072218] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-12 lg:py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Marca */}
        <div>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="DescubraSul"
              width={160}
              height={40}
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </Link>
          <p className="text-white/55 text-sm mt-4 leading-relaxed">
            A vitrine digital que conecta pessoas e negócios no Sul de Santa Catarina.
          </p>
          <div className="flex gap-2.5 mt-5">
            <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-accent hover:text-accent transition-colors">
              <InstagramIcon className="size-4" />
            </a>
            <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-accent hover:text-accent transition-colors">
              <FacebookIcon className="size-4" />
            </a>
            <a href="#" aria-label="WhatsApp" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-accent hover:text-accent transition-colors">
              <MessageCircle className="size-4" />
            </a>
          </div>
        </div>

        {/* Navegação */}
        <div>
          <p className="text-sm font-semibold mb-4 text-white/90">Navegação</p>
          <ul className="space-y-2.5 text-sm text-white/55">
            <li><Link href="/"              className="hover:text-accent transition-colors">Início</Link></li>
            <li><Link href="/marketplace"   className="hover:text-accent transition-colors">Marketplace</Link></li>
            <li><Link href="/food"          className="hover:text-accent transition-colors">DescubraSul Food</Link></li>
            <li><Link href="/para-empresas" className="hover:text-accent transition-colors">Para Empresas</Link></li>
            <li><Link href="/planos"        className="hover:text-accent transition-colors">Planos e preços</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <p className="text-sm font-semibold mb-4 text-white/90">Legal</p>
          <ul className="space-y-2.5 text-sm text-white/55">
            <li><Link href="/privacidade" className="hover:text-accent transition-colors">Política de privacidade</Link></li>
            <li><Link href="/termos"      className="hover:text-accent transition-colors">Termos de uso</Link></li>
            <li><Link href="/faq"         className="hover:text-accent transition-colors">Perguntas frequentes</Link></li>
            <li><Link href="/credits"     className="hover:text-accent transition-colors">Créditos de imagens</Link></li>
          </ul>
        </div>

        {/* Contato */}
        <div>
          <p className="text-sm font-semibold mb-4 text-white/90">Contato</p>
          <ul className="space-y-2.5 text-sm text-white/55">
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-accent shrink-0" />
              contato@descubrasul.com
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-accent shrink-0" />
              Sul de Santa Catarina, Brasil
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>© {year} DescubraSul · Todos os direitos reservados</span>
          <span>Feito no Sul de Santa Catarina</span>
        </div>
      </div>
    </footer>
  );
}
