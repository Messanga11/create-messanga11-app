export const PRODUCT_FEATURE_IDS = [
  "authentication",
  "categories",
  "couriers",
  "customers",
  "dashboard",
  "form-builder",
  "invoice",
  "notifications",
  "orders",
  "profile",
  "products",
  "settings",
  "stores",
  "team",
] as const;

export type ProductFeatureId = (typeof PRODUCT_FEATURE_IDS)[number];
