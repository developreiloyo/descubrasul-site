import {
  UtensilsCrossed, Car, Sparkles, HeartPulse, Dumbbell,
  House, Wrench, BriefcaseBusiness, Monitor, PawPrint,
  GraduationCap, Palmtree, Landmark, PartyPopper, Sprout, ShoppingBag,
} from "lucide-react";

export const CATEGORIA_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  UtensilsCrossed,
  Car,
  Sparkles,
  HeartPulse,
  Dumbbell,
  House,
  Wrench,
  BriefcaseBusiness,
  Monitor,
  PawPrint,
  GraduationCap,
  Palmtree,
  Landmark,
  PartyPopper,
  Sprout,
  ShoppingBag,
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
