"use client";

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
import { getEmailError } from "../shared/validation";

export function TeamFeature() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Aucune invitation locale créée.");

  function inviteMember() {
    const validationError = getEmailError(email);
    if (validationError) {
      setStatus(validationError);
      return;
    }
    setStatus("Invitation ajoutée localement pour la démonstration.");
    setEmail("");
  }

  return (
    <FeatureShell
      active="team"
      description="Le formulaire d’invitation est partagé ; aucune invitation réelle n’est envoyée."
      title="Gestion d’équipe"
    >
      <Card labelledBy="team-title">
        <CardCopy>
          <Badge>Équipe vide</Badge>
          <SectionHeading id="team-title">Inviter un membre</SectionHeading>
          <MetadataText>
            L’adaptateur de production devra utiliser l’opération sécurisée du serveur.
          </MetadataText>
          <TextField
            disabled={false}
            inputMode="email"
            label="Adresse e-mail du membre"
            onChange={setEmail}
            secure={false}
            value={email}
          />
        </CardCopy>
        <ActionButton disabled={false} onPress={inviteMember}>
          Ajouter l’invitation locale
        </ActionButton>
        <StatusText>{status}</StatusText>
      </Card>
    </FeatureShell>
  );
}
