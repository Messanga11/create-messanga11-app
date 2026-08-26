import type { FeatureBlockNode } from "@messanga11/core/features";
import { ResourceList, type ResourceListPrimitiveProps } from "@starter/ui-engine";
import type { ProductFeatureId } from "../feature-types";
import { FeatureShell } from "../shared/feature-shell";

interface ResourceFeatureProps {
  readonly node: FeatureBlockNode;
}

export function ResourceFeature({ node }: ResourceFeatureProps) {
  const resource = node.props as unknown as ResourceListPrimitiveProps;
  const featureId = resource.title.toLowerCase() as ProductFeatureId;
  return (
    <FeatureShell
      active={featureId}
      description=""
      showIntro={false}
      title={resource.title}
    >
      <ResourceList {...resource} />
    </FeatureShell>
  );
}
