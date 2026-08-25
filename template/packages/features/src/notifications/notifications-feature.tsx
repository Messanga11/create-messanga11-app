"use client";

import {
  ActionButton,
  Badge,
  Card,
  CardCopy,
  MetadataText,
  SectionHeading,
  StatusText,
} from "@starter/ui-engine";
import { useState } from "react";
import { FeatureShell } from "../shared/feature-shell";

export function NotificationsFeature() {
  const [hasNotification, setHasNotification] = useState(false);

  return (
    <FeatureShell
      active="notifications"
      description="Un état vide et une notification locale démontrent le même flux sur Web et Mobile."
      title="Notifications"
    >
      <Card labelledBy="notifications-title">
        <CardCopy>
          <Badge>{hasNotification ? "1 non lue" : "À jour"}</Badge>
          <SectionHeading id="notifications-title">
            Centre de notifications
          </SectionHeading>
          <MetadataText>
            {hasNotification
              ? "Une notification locale de démonstration est disponible."
              : "Aucune notification à afficher."}
          </MetadataText>
        </CardCopy>
        <ActionButton
          disabled={false}
          onPress={() => setHasNotification((current) => !current)}
        >
          {hasNotification ? "Marquer comme lue" : "Créer une notification locale"}
        </ActionButton>
        <StatusText>
          {hasNotification ? "Notification non lue." : "Boîte de réception vide."}
        </StatusText>
      </Card>
    </FeatureShell>
  );
}
