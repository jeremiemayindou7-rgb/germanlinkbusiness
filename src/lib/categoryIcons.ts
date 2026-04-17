import {
  Package,
  Tractor,
  Zap,
  Laptop,
  Car,
  Wrench,
  Snowflake,
  Smartphone,
  Tablet,
  Settings,
  Bike,
  Lightbulb,
  Battery,
  Cog,
  type LucideIcon,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  package: Package,
  tractor: Tractor,
  solar_power: Zap,
  laptop: Laptop,
  car: Car,
  wrench: Wrench,
  snowflake: Snowflake,
  smartphone: Smartphone,
  tablet: Tablet,
  settings: Settings,
  bike: Bike,
  zap: Zap,
  lightbulb: Lightbulb,
  battery: Battery,
  cog: Cog,
};

export const getIconComponent = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Package;
};
