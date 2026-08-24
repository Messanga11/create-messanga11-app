import { buildPolicyUiMeta, type PolicyDefinition } from "@messanga11/core/policy";
import { z } from "zod";

export const PROFILE_ACTIONS = ["view", "edit"] as const;
export type ProfileAction = (typeof PROFILE_ACTIONS)[number];
export type ProfilePermission = "profile:read" | "profile:update";

export const ProfileInputSchema = z
  .object({ profileId: z.string().min(1).max(100) })
  .strict();
export type ProfileInput = z.infer<typeof ProfileInputSchema>;

export const PROFILE_POLICY = {
  actions: {
    edit: {
      accessibility: { labelKey: "profile.actions.edit" },
      intent: "primary",
      permission: "profile:update",
      presentation: "disabled",
    },
    view: {
      accessibility: { labelKey: "profile.actions.view" },
      permission: "profile:read",
      presentation: "hidden",
    },
  },
  permissions: ["profile:read", "profile:update"],
  revision: "profile-policy:1",
} satisfies PolicyDefinition<ProfilePermission>;

export function buildProfileUiMeta(grantedPermissions: readonly ProfilePermission[]) {
  return buildPolicyUiMeta<ProfileAction, ProfilePermission>({
    actions: PROFILE_ACTIONS,
    expectedRevision: PROFILE_POLICY.revision,
    grantedPermissions,
    policy: PROFILE_POLICY,
  });
}
