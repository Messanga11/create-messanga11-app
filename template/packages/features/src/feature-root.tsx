"use client";

import { ProfileFeature } from "./profile/profile-feature";
import { SystemFeature } from "./system/system-feature";

export const FEATURE_IDS = [
  "profile",
  "system-error",
  "system-loading",
  "system-not-found",
] as const;

export type FeatureId = (typeof FEATURE_IDS)[number];

export interface FeatureRootProps {
  readonly featureId: FeatureId;
}

// SOT[feature-registry]: Every generated route resolves through this explicit registry.
export function FeatureRoot({ featureId }: FeatureRootProps) {
  if (featureId === "profile") {
    return <ProfileFeature />;
  }

  return <SystemFeature featureId={featureId} />;
}
