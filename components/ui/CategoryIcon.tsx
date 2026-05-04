import {
  Gamepad2,
  Headphones,
  Home,
  Laptop,
  LucideIcon,
  Package,
  Smartphone,
  Tablet,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  smartphones: Smartphone,
  laptops: Laptop,
  appliances: Home,
  headphones: Headphones,
  tablets: Tablet,
  gaming: Gamepad2,
};

interface CategoryIconProps {
  slug?: string | null;
  className?: string;
  style?: CSSProperties;
}

export default function CategoryIcon({ slug, className, style }: CategoryIconProps) {
  const Icon = slug ? CATEGORY_ICONS[slug] ?? Package : Package;

  return (
    <Icon
      aria-hidden="true"
      className={cn('text-gray-400', className)}
      style={style}
      strokeWidth={1.75}
    />
  );
}
