"use client";

import { canPerform } from "@messanga11/core";
import { buildProfileUiMeta } from "@starter/domain";
import {
  ActionButton,
  Badge,
  Card,
  CardCopy,
  MetadataText,
  SectionHeading,
  StatusText,
  TextField,
} from "@starter/ui-engine";
import { useState } from "react";
import { FeatureShell } from "../shared/feature-shell";
import { getDisplayNameError } from "../shared/validation";

const UI_META = buildProfileUiMeta(["profile:read", "profile:update"]);

export function ProfileFeature() {
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState("Aucune modification locale.");
  const canEdit = canPerform(UI_META, "edit");

  function saveProfile() {
    const validationError = getDisplayNameError(displayName);
    if (validationError) {
      setStatus(validationError);
      return;
    }
    setStatus("Profil enregistré localement pour la démonstration.");
  }

  return (
    <FeatureShell
      active="profile"
      description="La policy Core et le formulaire partagé gouvernent la même action sur les deux plateformes."
      title="Profil"
    >
      <Card labelledBy="profile-title">
        <CardCopy>
          <Badge>Core connecté</Badge>
          <SectionHeading id="profile-title">Informations publiques</SectionHeading>
          <MetadataText>Policy revision : {UI_META.revision}</MetadataText>
          <TextField
            disabled={!canEdit}
            inputMode="text"
            label="Nom affiché"
            onChange={setDisplayName}
            secure={false}
            value={displayName}
          />
        </CardCopy>
        <ActionButton disabled={!canEdit} onPress={saveProfile}>
          Enregistrer le profil
        </ActionButton>
        <StatusText>{status}</StatusText>
      </Card>
    </FeatureShell>
  );
}
