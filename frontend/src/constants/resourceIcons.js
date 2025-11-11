import { PRIMARY_META, toPrimary } from "./categoryMap";

export const RESOURCE_ICONS = new Proxy(PRIMARY_META, {
  get(target, prop) {
    const primary = toPrimary(prop);
    return target[primary] || target.other;
  },
});

export function metaForType(rawType) {
  return PRIMARY_META[toPrimary(rawType)] || PRIMARY_META.other;
}
