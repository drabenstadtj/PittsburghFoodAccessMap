// constants/resourceIcons.js
import { 
  ShoppingCart,
  Store,
  Sprout,
  Package,
  Leaf,
  MapPin,
  Circle,
  Building2
} from 'lucide-react';

/**
 * Resource type icon mapping with Lucide icons and brand-aligned colors
 * Each resource type has an icon component and a background color
 */
export const RESOURCE_ICONS = {
  'grocery': {
    icon: ShoppingCart,
    color: '#4CAF50',      // Green
    label: 'Grocery Store',
    emoji: '🛒'
  },
  'corner_store': {
    icon: Store,
    color: '#FF9800',      // Orange
    label: 'Corner Store',
    emoji: '🏪'
  },
  'farmers_market': {
    icon: Sprout,
    color: '#8BC34A',      // Light Green
    label: "Farmers' Market",
    emoji: '🌾'
  },
  'pantry': {
    icon: Package,
    color: '#E91E63',      // Pink
    label: 'Food Pantry',
    emoji: '🥫'
  },
  'urban_agriculture': {
    icon: Leaf,
    color: '#00BCD4',      // Cyan
    label: 'Urban Agriculture',
    emoji: '🌱'
  },
  'program_site': {
    icon: MapPin,
    color: '#9C27B0',      // Purple
    label: 'Program Site',
    emoji: '📍'
  },
  'other': {
    icon: Circle,
    color: '#757575',      // Gray
    label: 'Other',
    emoji: '📍'
  }
};

/**
 * Get icon component for a resource type
 * Falls back to 'other' if type not found
 */
export function getResourceIcon(type) {
  const normalized = type?.toLowerCase() || 'other';
  return RESOURCE_ICONS[normalized] || RESOURCE_ICONS.other;
}

/**
 * Get all resource types as array
 */
export function getResourceTypes() {
  return Object.keys(RESOURCE_ICONS);
}

/**
 * Backward compatibility function - same as getResourceIcon
 * @deprecated Use getResourceIcon instead
 */
export function metaForType(type) {
  return getResourceIcon(type);
}

/**
 * Icon component wrapper for consistent styling
 */
export function ResourceIcon({ type, size = 20, className = '' }) {
  const { icon: Icon, color } = getResourceIcon(type);
  
  return (
    <div 
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 8,
        height: size + 8,
        borderRadius: '50%',
        backgroundColor: color,
        color: 'white',
        flexShrink: 0
      }}
    >
      <Icon size={size} strokeWidth={2.5} />
    </div>
  );
}