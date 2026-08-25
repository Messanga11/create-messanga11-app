"use client";

import type { JsonValue } from "@messanga11/core";
import { calculateInvoiceAmounts, type InvoiceAmounts } from "@starter/domain";
import {
  ActionButton,
  Badge,
  Card,
  CardCopy,
  MetadataText,
  SectionHeading,
  StatusText,
  TextField,
  useFeatureMutation,
} from "@starter/ui-engine";
import { useState } from "react";
import { FeatureShell } from "../shared/feature-shell";

const MONEY = new Intl.NumberFormat("fr-FR", {
  currency: "XAF",
  maximumFractionDigits: 2,
  style: "currency",
});

interface InvoiceDraft {
  readonly clientName: string;
  readonly description: string;
  readonly quantity: string;
  readonly taxRate: string;
  readonly unitPrice: string;
}

const INITIAL_DRAFT: InvoiceDraft = {
  clientName: "Restaurant Le Mfoundi",
  description: "Conception de l’expérience de commande",
  quantity: "1",
  taxRate: "19.25",
  unitPrice: "250000",
};

export function InvoiceFeature({ operationId }: Readonly<{ operationId: string }>) {
  const executeMutation = useFeatureMutation();
  const [draft, setDraft] = useState<InvoiceDraft>(INITIAL_DRAFT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("Brouillon non enregistré.");
  const [invoiceNumber, setInvoiceNumber] = useState("Brouillon");
  const amounts = readAmounts(draft);

  async function saveInvoice() {
    if (
      !amounts ||
      draft.clientName.trim().length < 2 ||
      draft.description.trim().length === 0
    ) {
      setStatus("Renseignez un client, une prestation et des montants valides.");
      return;
    }
    setIsSubmitting(true);
    setStatus("Enregistrement sécurisé…");
    try {
      const result = await executeMutation({
        featureId: "invoice",
        input: toInput(draft),
        operationId,
      });
      setInvoiceNumber(readResultString(result, "invoiceNumber") ?? "Enregistrée");
      setStatus("Facture enregistrée dans SQLite.");
    } catch {
      setStatus("La facture n’a pas pu être enregistrée.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FeatureShell
      active="invoice"
      description="Composez une facture, contrôlez ses totaux en direct et enregistrez-la par l’opération déclarée dans le catalogue."
      title="Mini générateur de facture"
    >
      <InvoiceEditor
        draft={draft}
        isSubmitting={isSubmitting}
        onChange={setDraft}
        onSave={() => void saveInvoice()}
      />
      <InvoicePreview
        amounts={amounts}
        draft={draft}
        invoiceNumber={invoiceNumber}
        status={status}
      />
    </FeatureShell>
  );
}

function InvoiceEditor(
  props: Readonly<{
    draft: InvoiceDraft;
    isSubmitting: boolean;
    onChange: (draft: InvoiceDraft) => void;
    onSave: () => void;
  }>,
) {
  const update = (key: keyof InvoiceDraft) => (value: string) =>
    props.onChange({ ...props.draft, [key]: value });
  return (
    <Card labelledBy="invoice-editor-title">
      <CardCopy>
        <Badge>Éditeur</Badge>
        <SectionHeading id="invoice-editor-title">
          Informations de facturation
        </SectionHeading>
        <TextField
          disabled={props.isSubmitting}
          inputMode="text"
          label="Client"
          onChange={update("clientName")}
          secure={false}
          value={props.draft.clientName}
        />
        <TextField
          disabled={props.isSubmitting}
          inputMode="text"
          label="Prestation"
          onChange={update("description")}
          secure={false}
          value={props.draft.description}
        />
        <TextField
          disabled={props.isSubmitting}
          inputMode="decimal"
          label="Quantité"
          onChange={update("quantity")}
          secure={false}
          value={props.draft.quantity}
        />
        <TextField
          disabled={props.isSubmitting}
          inputMode="decimal"
          label="Prix unitaire (XAF)"
          onChange={update("unitPrice")}
          secure={false}
          value={props.draft.unitPrice}
        />
        <TextField
          disabled={props.isSubmitting}
          inputMode="decimal"
          label="TVA (%)"
          onChange={update("taxRate")}
          secure={false}
          value={props.draft.taxRate}
        />
      </CardCopy>
      <ActionButton disabled={props.isSubmitting} onPress={props.onSave}>
        {props.isSubmitting ? "Enregistrement…" : "Enregistrer la facture"}
      </ActionButton>
    </Card>
  );
}

function InvoicePreview(
  props: Readonly<{
    amounts: InvoiceAmounts | undefined;
    draft: InvoiceDraft;
    invoiceNumber: string;
    status: string;
  }>,
) {
  return (
    <Card labelledBy="invoice-preview-title">
      <CardCopy>
        <Badge>{props.invoiceNumber}</Badge>
        <SectionHeading id="invoice-preview-title">Aperçu de la facture</SectionHeading>
        <MetadataText>Client : {props.draft.clientName || "—"}</MetadataText>
        <MetadataText>Prestation : {props.draft.description || "—"}</MetadataText>
        <MetadataText>
          Sous-total : {formatAmount(props.amounts?.subtotal)}
        </MetadataText>
        <MetadataText>TVA : {formatAmount(props.amounts?.tax)}</MetadataText>
        <SectionHeading id="invoice-total">
          Total : {formatAmount(props.amounts?.total)}
        </SectionHeading>
      </CardCopy>
      <StatusText>{props.status}</StatusText>
    </Card>
  );
}

function readAmounts(draft: InvoiceDraft): InvoiceAmounts | undefined {
  return calculateInvoiceAmounts({
    quantity: parseDecimal(draft.quantity),
    taxRate: parseDecimal(draft.taxRate),
    unitPrice: parseDecimal(draft.unitPrice),
  });
}

function toInput(draft: InvoiceDraft): JsonValue {
  return {
    clientName: draft.clientName.trim(),
    currency: "XAF",
    description: draft.description.trim(),
    quantity: parseDecimal(draft.quantity),
    taxRate: parseDecimal(draft.taxRate),
    unitPrice: parseDecimal(draft.unitPrice),
  };
}

function parseDecimal(value: string): number {
  return Number(value.replace(",", "."));
}

function formatAmount(value: number | undefined): string {
  return value === undefined ? "—" : MONEY.format(value);
}

function readResultString(value: JsonValue, key: string): string | undefined {
  if (!isJsonObject(value)) return undefined;
  const result = value[key];
  return typeof result === "string" ? result : undefined;
}

function isJsonObject(value: JsonValue): value is Readonly<Record<string, JsonValue>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
