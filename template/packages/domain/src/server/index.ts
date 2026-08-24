import {
  createProtectedOperation,
  type ProtectedOperationPorts,
} from "@messanga11/core/server";
import { type ProfileInput, ProfileInputSchema } from "../profile-policy";

export interface ProfileRecord {
  readonly id: string;
  readonly displayName: string;
}

export interface CreateReadProfileOperationOptions {
  readonly loadProfile: (input: ProfileInput) => Promise<ProfileRecord>;
  readonly ports: ProtectedOperationPorts;
}

export function createReadProfileOperation(options: CreateReadProfileOperationOptions) {
  return createProtectedOperation({
    handler: async (input) => options.loadProfile(input),
    kind: "query",
    name: "profile.read",
    permission: "profile:read",
    ports: options.ports,
    schema: ProfileInputSchema,
  });
}
