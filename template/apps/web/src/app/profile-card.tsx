"use client";

import { canPerform, type UiMeta } from "@messanga11/core";
import type { PolicyDenialCode } from "@messanga11/core/policy";
import type { ProfileAction } from "@starter/domain";
import {
  ActionButton,
  Badge,
  Card,
  CardCopy,
  MetadataText,
  SectionHeading,
  StatusText,
} from "@starter/ui-web";
import { useState } from "react";

interface ProfileCardProps {
  readonly uiMeta: UiMeta<ProfileAction, PolicyDenialCode>;
}

export function ProfileCard({ uiMeta }: ProfileCardProps) {
  const [message, setMessage] = useState("Prêt à construire.");
  const canEdit = canPerform(uiMeta, "edit");

  return (
    <Card labelledBy="profile-title">
      <CardCopy>
        <Badge>Core connecté</Badge>
        <SectionHeading id="profile-title">Profil de démonstration</SectionHeading>
        <MetadataText>Policy revision : {uiMeta.revision}</MetadataText>
      </CardCopy>
      <ActionButton
        disabled={!canEdit}
        onPress={() => setMessage("Action UI reçue. Branche maintenant ton API.")}
      >
        Modifier le profil
      </ActionButton>
      <StatusText>{message}</StatusText>
    </Card>
  );
}
