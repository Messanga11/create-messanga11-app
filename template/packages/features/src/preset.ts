import type { ProductFeatureId } from "./feature-types";

export const APP_PRESET = "__PRESET__" as const;

const ESSENTIALS = [
  "authentication",
  "dashboard",
  "form-builder",
  "notifications",
  "profile",
  "settings",
  "team",
] as const satisfies readonly ProductFeatureId[];

const COMMERCE = [
  ...ESSENTIALS,
  "categories",
  "customers",
  "invoice",
  "orders",
  "products",
  "stores",
] as const satisfies readonly ProductFeatureId[];

export const PRESET_FEATURE_IDS: Readonly<Record<string, readonly ProductFeatureId[]>> =
  {
    admin: [...COMMERCE, "couriers"],
    booking: ESSENTIALS,
    commerce: COMMERCE,
    content: ESSENTIALS,
    custom: ["dashboard"],
    delivery: [...COMMERCE, "couriers"],
    marketplace: COMMERCE,
    saas: ESSENTIALS,
  };

export const ENABLED_FEATURE_IDS = Object.freeze(
  PRESET_FEATURE_IDS[APP_PRESET] ?? PRESET_FEATURE_IDS.admin ?? [],
);
