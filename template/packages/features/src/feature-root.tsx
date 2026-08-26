"use client";

import type { FeatureBlockNode, FeatureNode } from "@messanga11/core/features";
import { compileFeatureCatalog } from "@messanga11/core/features";
import { FeatureLayout } from "@starter/ui-engine";
import type { ComponentType, ReactNode } from "react";
import { APP_FEATURE_CATALOG, type AppFeatureId } from "./app.feature";
import { AuthenticationFeature } from "./authentication/authentication-feature";
import { DashboardFeature } from "./dashboard/dashboard-feature";
import { FormBuilderFeature } from "./form-builder/form-builder-feature";
import { InvoiceFeature } from "./invoice/invoice-feature";
import { NotificationsFeature } from "./notifications/notifications-feature";
import { ProfileFeature } from "./profile/profile-feature";
import { ResourceFeature } from "./resources/resource-feature";
import { SettingsFeature } from "./settings/settings-feature";
import { SystemFeature } from "./system/system-feature";
import { TeamFeature } from "./team/team-feature";

const COMPILED_CATALOG = compileFeatureCatalog(APP_FEATURE_CATALOG);
const BLOCKS: Readonly<
  Record<string, ComponentType<{ readonly node: FeatureBlockNode }>>
> = {
  "authentication.screen": AuthenticationFeature,
  "dashboard.screen": ({ node }) => <DashboardFeature node={node} />,
  "form-builder.complex": ({ node }) => (
    <FormBuilderFeature operationId={node.actions?.submit ?? ""} />
  ),
  "invoice.builder": ({ node }) => (
    <InvoiceFeature operationId={node.actions?.save ?? ""} />
  ),
  "notifications.screen": NotificationsFeature,
  "profile.screen": ProfileFeature,
  "resource.list": ({ node }) => <ResourceFeature node={node} />,
  "settings.screen": SettingsFeature,
  "team.screen": TeamFeature,
};

export type FeatureId =
  | AppFeatureId
  | "system-error"
  | "system-loading"
  | "system-not-found";

export interface FeatureRootProps {
  readonly featureId: FeatureId;
  readonly pageId?: string;
}

export function FeatureRoot({ featureId, pageId = "index" }: FeatureRootProps) {
  if (featureId.startsWith("system-")) {
    return (
      <SystemFeature
        featureId={featureId as "system-error" | "system-loading" | "system-not-found"}
      />
    );
  }
  const page = COMPILED_CATALOG.pages[`${featureId}.${pageId}`];
  if (!page) return <SystemFeature featureId="system-not-found" />;
  return renderNode(page.root);
}

function renderNode(node: FeatureNode): ReactNode {
  if (node.kind === "block") {
    const Block = BLOCKS[node.block];
    return Block ? <Block key={node.id} node={node} /> : null;
  }
  return (
    <FeatureLayout key={node.id} layout={node.layout} properties={node.props ?? {}}>
      {node.children.map(renderNode)}
    </FeatureLayout>
  );
}
