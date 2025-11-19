// constants/categoryMap.js

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

export const PRIMARY_META = {
  grocery: { label: "Grocery Store", symbol: "🛒", color: "#28a745" },
  farmers_market: { label: "Farmers' Market", symbol: "🌽", color: "#ffc107" },
  pantry: { label: "Food Pantry", symbol: "🥫", color: "#007bff" },
  urban_agriculture: {
    label: "Urban Agriculture",
    symbol: "🌱",
    color: "#20c997",
  },
  program_site: { label: "Program Site", symbol: "🏷️", color: "#6f42c1" },
  corner_store: { label: "Corner Store", symbol: "🏪", color: "#fd7e14" },
  other: { label: "Other", symbol: "📍", color: "#6c757d" },
};

export const PRIMARY_ORDER = [
  "grocery",
  "corner_store",
  "farmers_market",
  "pantry",
  "urban_agriculture",
  "program_site",
  "other",
];

export function toPrimary(rawType) {
  if (!rawType) return "other";
  const key = String(rawType).trim().toLowerCase().replaceAll("-", "_");
  return RAW_TO_PRIMARY[key] || "other";
}
