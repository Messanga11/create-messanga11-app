export const PRODUCT_FEATURE_IDS = [
  "authentication",
  "dashboard",
  "form-builder",
  "invoice",
  "notifications",
  "profile",
  "settings",
  "team",
] as const;

export type ProductFeatureId = (typeof PRODUCT_FEATURE_IDS)[number];
