import {
  ShoppingCart,
  Store,
  Sprout,
  Package,
  Leaf,
  MapPin,
  Circle,
} from 'lucide-react';

// Raw DB type → canonical primary type
export const RAW_TO_PRIMARY = {
  community_farm: "urban_agriculture",
  community_garden: "urban_agriculture",
  school_garden: "urban_agriculture",
  urban_farm: "urban_agriculture",
  program_site: "program_site",
  partner_site: "program_site",
  funded_site: "program_site",
  grocery: "grocery",
  farmers_market: "farmers_market",
  pantry: "pantry",
  corner_store: "corner_store",
  other: "other",
};

export function toPrimary(rawType) {
  if (!rawType) return "other";
  const key = String(rawType).trim().toLowerCase().replaceAll("-", "_");
  return RAW_TO_PRIMARY[key] || "other";
}

// Icon and visual metadata per primary type
export const RESOURCE_ICONS = {
  grocery: {
    icon: ShoppingCart,
    color: '#4CAF50',
    label: 'Grocery Store',
    emoji: '🛒',
  },
  corner_store: {
    icon: Store,
    color: '#FF9800',
    label: 'Corner Store',
    emoji: '🏪',
  },
  farmers_market: {
    icon: Sprout,
    color: '#8BC34A',
    label: "Farmers' Market",
    emoji: '🌾',
  },
  pantry: {
    icon: Package,
    color: '#E91E63',
    label: 'Food Pantry',
    emoji: '🥫',
  },
  urban_agriculture: {
    icon: Leaf,
    color: '#00BCD4',
    label: 'Urban Agriculture',
    emoji: '🌱',
  },
  program_site: {
    icon: MapPin,
    color: '#9C27B0',
    label: 'Program Site',
    emoji: '📍',
  },
  other: {
    icon: Circle,
    color: '#757575',
    label: 'Other',
    emoji: '📍',
  },
};

export function getResourceIcon(type) {
  const normalized = type?.toLowerCase() || 'other';
  return RESOURCE_ICONS[normalized] || RESOURCE_ICONS.other;
}

export function getResourceTypes() {
  return Object.keys(RESOURCE_ICONS);
}

/** @deprecated Use getResourceIcon instead */
export function metaForType(type) {
  return getResourceIcon(type);
}

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
        flexShrink: 0,
      }}
    >
      <Icon size={size} strokeWidth={2.5} />
    </div>
  );
}
