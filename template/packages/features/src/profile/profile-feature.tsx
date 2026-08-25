"use client";

import { canPerform } from "@messanga11/core";
import { buildProfileUiMeta } from "@starter/domain";
import {
  ActionButton,
  Badge,
  Card,
  CardCopy,
  DisplayHeading,
  Eyebrow,
  IntroText,
  MetadataText,
  Page,
  SectionHeading,
  StatusText,
} from "@starter/ui-engine";
import { useState } from "react";

const UI_META = buildProfileUiMeta(["profile:read", "profile:update"]);

export function ProfileFeature() {
  const [message, setMessage] = useState("Prêt à construire.");
  const canEdit = canPerform(UI_META, "edit");

  return (
    <Page>
      <Eyebrow>MESSANGA11 STARTER</Eyebrow>
      <DisplayHeading>Une logique UI, deux moteurs de rendu.</DisplayHeading>
      <IntroText>
        Cette composition, son état et ses actions vivent uniquement dans le package
        features.
      </IntroText>
      <Card labelledBy="profile-title">
        <CardCopy>
          <Badge>Core connecté</Badge>
          <SectionHeading id="profile-title">Profil de démonstration</SectionHeading>
          <MetadataText>Policy revision : {UI_META.revision}</MetadataText>
        </CardCopy>
        <ActionButton
          disabled={!canEdit}
          onPress={() => setMessage("Action reçue. Branche maintenant ton API.")}
        >
          Modifier le profil
        </ActionButton>
        <StatusText>{message}</StatusText>
      </Card>
    </Page>
  );
}
