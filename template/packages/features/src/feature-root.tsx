"use client";

import { AuthenticationFeature } from "./authentication/authentication-feature";
import { DashboardFeature } from "./dashboard/dashboard-feature";
import { PRODUCT_FEATURE_IDS } from "./feature-types";
import { FormBuilderFeature } from "./form-builder/form-builder-feature";
import { NotificationsFeature } from "./notifications/notifications-feature";
import { ProfileFeature } from "./profile/profile-feature";
import { SettingsFeature } from "./settings/settings-feature";
import { SystemFeature } from "./system/system-feature";
import { TeamFeature } from "./team/team-feature";

export const FEATURE_IDS = [
  ...PRODUCT_FEATURE_IDS,
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
  switch (featureId) {
    case "authentication":
      return <AuthenticationFeature />;
    case "dashboard":
      return <DashboardFeature />;
    case "form-builder":
      return <FormBuilderFeature />;
    case "notifications":
      return <NotificationsFeature />;
    case "profile":
      return <ProfileFeature />;
    case "settings":
      return <SettingsFeature />;
    case "team":
      return <TeamFeature />;
    default:
      return <SystemFeature featureId={featureId} />;
  }
}
