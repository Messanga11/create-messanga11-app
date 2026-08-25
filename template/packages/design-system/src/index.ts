import { createDesignSystem } from "@messanga11/core/design";
import designOverrides from "../design.config.json";

export const designTokens = createDesignSystem(designOverrides);
export type { DesignTokenOverrides, DesignTokens } from "@messanga11/core/design";
