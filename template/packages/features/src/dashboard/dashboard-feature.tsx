import type { FeatureBlockNode } from "@messanga11/core/features";
import {
  AnalyticsDashboard,
  type AnalyticsDashboardPrimitiveProps,
} from "@starter/ui-engine";
import { FeatureShell } from "../shared/feature-shell";

interface DashboardFeatureProps {
  readonly node: FeatureBlockNode;
}

export function DashboardFeature({ node }: DashboardFeatureProps) {
  const dashboard = node.props as unknown as AnalyticsDashboardPrimitiveProps;
  return (
    <FeatureShell
      active="dashboard"
      description="Suivez l’activité commerciale, les livraisons et les commandes récentes."
      showIntro={false}
      title="Overview"
    >
      <AnalyticsDashboard {...dashboard} />
    </FeatureShell>
  );
}
