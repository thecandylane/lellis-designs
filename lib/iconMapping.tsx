import { Heart, Clock, ShoppingBag, Palette, Shield, Truck, MapPin, Award, Star } from 'lucide-react'

export const iconMap: Record<string, React.ComponentType<any>> = {
  'heart': Heart,
  'clock': Clock,
  'shopping-bag': ShoppingBag,
  'palette': Palette,
  'shield': Shield,
  'truck': Truck,
  'map-pin': MapPin,
  'award': Award,
  'star': Star,
}

export function getIcon(iconName: string) {
  return iconMap[iconName] || Heart
}
