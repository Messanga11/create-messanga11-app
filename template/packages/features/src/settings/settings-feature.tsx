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

export function SettingsFeature() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <FeatureShell
      active="settings"
      description="Les préférences restent dans la logique partagée et les contrôles gardent leur comportement natif."
      title="Paramètres"
    >
      <Card labelledBy="notification-settings-title">
        <CardCopy>
          <Badge>Préférence locale</Badge>
          <SectionHeading id="notification-settings-title">
            Notifications
          </SectionHeading>
          <MetadataText>
            Active ou désactive les notifications dans cette démonstration.
          </MetadataText>
        </CardCopy>
        <ActionButton
          disabled={false}
          onPress={() => setNotificationsEnabled((enabled) => !enabled)}
        >
          {notificationsEnabled ? "Désactiver" : "Activer"}
        </ActionButton>
        <StatusText>
          {notificationsEnabled
            ? "Notifications activées."
            : "Notifications désactivées."}
        </StatusText>
      </Card>
    </FeatureShell>
  );
}
