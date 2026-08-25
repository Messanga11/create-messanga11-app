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
import { getEmailError, getPasswordError } from "../shared/validation";

export function AuthenticationFeature() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Aucune session locale active.");

  function authenticateLocally() {
    const validationError = getEmailError(email) ?? getPasswordError(password);
    if (validationError) {
      setStatus(validationError);
      return;
    }
    setPassword("");
    setStatus("Session de démonstration active dans cet écran.");
  }

  return (
    <FeatureShell
      active="authentication"
      description="Un formulaire partagé, projeté avec les contrôles natifs de chaque plateforme."
      title="Authentification"
    >
      <Card labelledBy="authentication-title">
        <CardCopy>
          <Badge>Mode local</Badge>
          <SectionHeading id="authentication-title">Se connecter</SectionHeading>
          <MetadataText>
            Cette démo n’envoie ni identifiant ni secret à un serveur.
          </MetadataText>
          <TextField
            disabled={false}
            inputMode="email"
            label="Adresse e-mail"
            onChange={setEmail}
            secure={false}
            value={email}
          />
          <TextField
            disabled={false}
            inputMode="text"
            label="Mot de passe"
            onChange={setPassword}
            secure={true}
            value={password}
          />
        </CardCopy>
        <ActionButton disabled={false} onPress={authenticateLocally}>
          Ouvrir une session de démonstration
        </ActionButton>
        <StatusText>{status}</StatusText>
      </Card>
    </FeatureShell>
  );
}
