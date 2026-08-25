"use client";

import { DisplayHeading, Eyebrow, IntroText, Page } from "@starter/ui-engine";
import type { FeatureId } from "../feature-root";

interface SystemFeatureProps {
  readonly featureId: Extract<FeatureId, `system-${string}`>;
}

const SYSTEM_COPY = {
  "system-error": {
    eyebrow: "ERREUR",
    heading: "Une erreur est survenue.",
    message: "Réessayez ou revenez à l’écran précédent.",
  },
  "system-loading": {
    eyebrow: "CHARGEMENT",
    heading: "Chargement en cours.",
    message: "Le contenu sera disponible dans un instant.",
  },
  "system-not-found": {
    eyebrow: "INTROUVABLE",
    heading: "Cette page n’existe pas.",
    message: "Vérifiez l’adresse ou revenez à l’écran précédent.",
  },
} as const;

export function SystemFeature({ featureId }: SystemFeatureProps) {
  const copy = SYSTEM_COPY[featureId];

  return (
    <Page>
      <Eyebrow>{copy.eyebrow}</Eyebrow>
      <DisplayHeading>{copy.heading}</DisplayHeading>
      <IntroText>{copy.message}</IntroText>
    </Page>
  );
}
