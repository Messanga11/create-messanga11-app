"use client";

import type { FormDefinition, FormValues } from "@messanga11/core/forms";
import { FormBuilder } from "@starter/ui-engine";
import { FeatureShell } from "../shared/feature-shell";

const REQUIRED_RULE = {
  code: "required",
  messageKey: "Ce champ est obligatoire.",
  type: "required",
} as const;

const TEAM_FORM: FormDefinition = {
  id: "team-onboarding",
  schemaVersion: 1,
  steps: [
    {
      descriptionKey: "Identité et sécurisation du compte",
      fields: [
        {
          id: "email",
          kind: "email",
          labelKey: "Adresse e-mail",
          name: "email",
          rules: [
            REQUIRED_RULE,
            {
              code: "email",
              messageKey: "Adresse e-mail invalide.",
              type: "email",
            },
          ],
        },
        {
          id: "phone",
          kind: "phone",
          labelKey: "Téléphone",
          name: "phone",
          rules: [REQUIRED_RULE],
        },
        {
          id: "otp",
          kind: "otp",
          labelKey: "Code de vérification",
          name: "otp",
          rules: [
            REQUIRED_RULE,
            {
              code: "otp.length",
              messageKey: "Saisissez les 6 chiffres.",
              type: "minLength",
              value: 6,
            },
          ],
        },
        {
          id: "companyType",
          kind: "select",
          labelKey: "Type de structure",
          name: "companyType",
          options: [
            { labelKey: "Entreprise", value: "business" },
            { labelKey: "Association", value: "nonprofit" },
          ],
        },
        {
          condition: { equals: "business", field: "companyType" },
          id: "company",
          kind: "text",
          labelKey: "Raison sociale",
          name: "company",
          rules: [REQUIRED_RULE],
        },
      ],
      id: "identity",
      titleKey: "Identité",
    },
    {
      descriptionKey: "Accès, disponibilité et collaborateurs",
      fields: [
        {
          id: "country",
          kind: "async-select",
          labelKey: "Pays",
          name: "country",
          optionsSource: "countries",
          rules: [REQUIRED_RULE],
        },
        {
          id: "roles",
          kind: "multi-select",
          labelKey: "Rôles",
          name: "roles",
          options: [
            { labelKey: "Administration", value: "admin" },
            { labelKey: "Finance", value: "finance" },
            { labelKey: "Support", value: "support" },
          ],
        },
        {
          id: "availability",
          kind: "date-range",
          labelKey: "Période et fuseau",
          name: "availability",
          rules: [REQUIRED_RULE],
        },
        {
          fields: [
            {
              id: "memberName",
              kind: "text",
              labelKey: "Nom",
              name: "name",
            },
            {
              id: "memberEmail",
              kind: "email",
              labelKey: "E-mail",
              name: "email",
            },
          ],
          id: "members",
          kind: "repeater",
          labelKey: "Membres à inviter",
          maxItems: 5,
          minItems: 1,
          name: "members",
        },
        {
          accept: ["application/pdf", "image/png", "image/jpeg"],
          id: "documents",
          kind: "file",
          labelKey: "Documents justificatifs",
          maxBytes: 5_000_000,
          maxItems: 3,
          name: "documents",
        },
      ],
      id: "team",
      titleKey: "Équipe",
    },
    {
      descriptionKey: "Vérifiez les données avant l’enregistrement.",
      fields: [],
      id: "review",
      titleKey: "Vérification",
    },
  ],
  submitLabelKey: "Créer l’espace",
  titleKey: "Configuration de l’équipe",
};

const DEFAULT_VALUES: FormValues = {
  availability: { end: "", start: "", timezone: "Africa/Douala" },
  companyType: "business",
  country: "CM",
  documents: [],
  members: [{ email: "", name: "", rowId: "member-initial" }],
  roles: ["admin"],
};

export function FormBuilderFeature() {
  return (
    <FeatureShell
      active="form-builder"
      description="Un seul schéma et une seule logique métier, projetés par deux moteurs accessibles Web et Native. Les soumissions Web sont persistées dans SQLite en développement."
      title="FormBuilder complexe"
    >
      <FormBuilder
        defaultValues={DEFAULT_VALUES}
        definition={TEAM_FORM}
        resource="form_submissions"
      />
    </FeatureShell>
  );
}
