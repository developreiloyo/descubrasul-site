import React from "react";
import {
  WrenchScrewdriverIcon,
  SparklesIcon,
  HomeModernIcon,
  PaintBrushIcon,
  BriefcaseIcon,
  BanknotesIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  TicketIcon,
  FireIcon,
  HomeIcon,
  SunIcon,
  Cog6ToothIcon,
  WrenchIcon,
  SwatchIcon,
  HeartIcon,
  PlusCircleIcon,
  KeyIcon,
  RectangleStackIcon,
  ScaleIcon,
  TruckIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  MapPinIcon,
  BoltIcon,
  ShoppingBagIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

type IconProps = { size?: number; className?: string };

function hero(HeroIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>) {
  return function ({ size = 24, className = "" }: IconProps) {
    return <HeroIcon width={size} height={size} className={className} />;
  };
}

export const CATEGORIA_ICONS: Record<string, React.ComponentType<IconProps>> = {
  // ── Chaves usadas no banco (novos slugs-nome) ──────────────────────────
  WrenchScrewdriver: hero(WrenchScrewdriverIcon), // Automotivo
  Sparkles:          hero(SparklesIcon),           // Beleza e Bem-estar
  HomeModern:        hero(HomeModernIcon),          // Casa e Construção
  PaintBrush:        hero(PaintBrushIcon),          // Comunicação Visual
  Briefcase:         hero(BriefcaseIcon),           // Consultoria
  Banknotes:         hero(BanknotesIcon),           // Contabilidade e Finanças
  AcademicCap:       hero(AcademicCapIcon),         // Educação e Treinamentos
  BuildingOffice2:   hero(BuildingOffice2Icon),     // Engenharia e Arquitetura
  Ticket:            hero(TicketIcon),              // Eventos e Entretenimento
  Fire:              hero(FireIcon),                // Gastronomia e Alimentação
  Home:              hero(HomeIcon),                // Imobiliário
  Sun:               hero(SunIcon),                // Limpeza e Conservação
  Cog6Tooth:         hero(Cog6ToothIcon),           // Locação de Equipamentos
  Wrench:            hero(WrenchIcon),              // Manutenção e Assistência Técnica
  Swatch:            hero(SwatchIcon),              // Moda, Costura e Locações
  Heart:             hero(HeartIcon),               // Pets
  PlusCircle:        hero(PlusCircleIcon),          // Saúde
  Key:               hero(KeyIcon),                // Segurança e Chaveiros
  RectangleStack:    hero(RectangleStackIcon),      // Serviços Gerais
  Scale:             hero(ScaleIcon),               // Serviços Jurídicos
  Truck:             hero(TruckIcon),               // Serviços Vehiculares
  ComputerDesktop:   hero(ComputerDesktopIcon),     // Tecnologia
  GlobeAlt:          hero(GlobeAltIcon),            // Transporte e Logística
  MapPin:            hero(MapPinIcon),              // Turismo e Hospedagem

  // ── Compat: nomes Lucide antigos (setados manualmente no admin) ────────
  UtensilsCrossed:   hero(FireIcon),              // Restaurantes / Alimentos
  Car:               hero(TruckIcon),             // Automotivo
  HeartPulse:        hero(PlusCircleIcon),         // Saúde
  Dumbbell:          hero(BoltIcon),              // Esporte e Fitness
  House:             hero(HomeIcon),              // Casa e Construção
  BriefcaseBusiness: hero(BriefcaseIcon),          // Profissionais
  Monitor:           hero(ComputerDesktopIcon),    // Tecnologia
  PawPrint:          hero(HeartIcon),              // Pets
  GraduationCap:     hero(AcademicCapIcon),        // Educação
  Palmtree:          hero(GlobeAltIcon),           // Turismo
  Landmark:          hero(BuildingLibraryIcon),    // Finanças e Seguros
  PartyPopper:       hero(TicketIcon),             // Eventos
  Sprout:            hero(SunIcon),               // Agropecuária
  ShoppingBag:       hero(ShoppingBagIcon),        // Comércio

  // ── Compat: emojis antigos ──────────────────────────────────────────
  "🍽️": hero(FireIcon),
  "👗":  hero(SwatchIcon),
  "💅":  hero(SparklesIcon),
  "💪":  hero(BoltIcon),
  "🐾":  hero(HeartIcon),
  "🏥":  hero(PlusCircleIcon),
  "📚":  hero(AcademicCapIcon),
  "🛍️": hero(ShoppingBagIcon),
  "🔧":  hero(WrenchIcon),
  "🥗":  hero(FireIcon),
};

export function CategoriaIcon({
  icone,
  size = 24,
  className = "",
}: {
  icone: string;
  size?: number;
  className?: string;
}) {
  const Icon = CATEGORIA_ICONS[icone];
  if (!Icon) return <span aria-hidden="true">{icone}</span>;
  return <Icon size={size} className={className} />;
}
