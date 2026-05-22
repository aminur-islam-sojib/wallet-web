import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BriefcaseBusiness,
  Bus,
  Car,
  Circle,
  Coffee,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Music,
  PiggyBank,
  Plane,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Stethoscope,
  Ticket,
  UtensilsCrossed,
  WalletCards,
  Fuel,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { CategoryIconId } from "@/features/wallet/lib/category-icons";

const iconMap: Record<CategoryIconId, LucideIcon> = {
  circle: Circle,
  "shopping-bag": ShoppingBag,
  "shopping-cart": ShoppingCart,
  utensils: UtensilsCrossed,
  coffee: Coffee,
  home: Home,
  car: Car,
  bus: Bus,
  plane: Plane,
  fuel: Fuel,
  briefcase: BriefcaseBusiness,
  wallet: WalletCards,
  "piggy-bank": PiggyBank,
  gift: Gift,
  heart: Heart,
  stethoscope: Stethoscope,
  "graduation-cap": GraduationCap,
  book: BookOpen,
  music: Music,
  smartphone: Smartphone,
  shield: ShieldCheck,
  ticket: Ticket,
};

type CategoryIconProps = {
  icon: string;
  className?: string;
  iconClassName?: string;
} & Omit<ComponentProps<"span">, "children">;

export function CategoryIcon({
  icon,
  className,
  iconClassName,
  ...props
}: CategoryIconProps) {
  const Icon = iconMap[icon as CategoryIconId] ?? Circle;

  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      aria-hidden="true"
      {...props}
    >
      <Icon className={cn("size-4", iconClassName)} />
    </span>
  );
}
