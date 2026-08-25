"use client";

import { type FeatureId, FeatureRoot } from "@starter/features";
import {
  type ActionPrimitiveProps,
  type IdentifiedPrimitiveProps,
  type LabelledPrimitiveProps,
  type NavigationPrimitiveProps,
  type PrimitiveProps,
  type TextFieldPrimitiveProps,
  type UiEngine,
  UiEngineProvider,
} from "@starter/ui-engine";
import { createElement } from "react";
import { WebFormBuilder } from "./form-builder";

function Page({ children }: PrimitiveProps) {
  return createElement("main", { className: "shell" }, children);
}

function Eyebrow({ children }: PrimitiveProps) {
  return createElement("p", { className: "eyebrow" }, children);
}

function DisplayHeading({ children }: PrimitiveProps) {
  return createElement("h1", { className: "display-heading" }, children);
}

function IntroText({ children }: PrimitiveProps) {
  return createElement("p", { className: "lede" }, children);
}

function Card({ children, labelledBy }: LabelledPrimitiveProps) {
  return createElement(
    "section",
    { "aria-labelledby": labelledBy, className: "card" },
    children,
  );
}

function CardCopy({ children }: PrimitiveProps) {
  return createElement("div", { className: "card-copy" }, children);
}

function Badge({ children }: PrimitiveProps) {
  return createElement("span", { className: "badge" }, children);
}

function SectionHeading({ children, id }: IdentifiedPrimitiveProps) {
  return createElement("h2", { className: "section-heading", id }, children);
}

function MetadataText({ children }: PrimitiveProps) {
  return createElement("p", { className: "metadata" }, children);
}

function StatusText({ children }: PrimitiveProps) {
  return createElement("p", { "aria-live": "polite", className: "status" }, children);
}

function ActionButton({ children, disabled, onPress }: ActionPrimitiveProps) {
  return createElement(
    "button",
    {
      className: "action-button",
      disabled,
      onClick: onPress,
      type: "button",
    },
    children,
  );
}

function NavigationGroup({ children }: PrimitiveProps) {
  return createElement(
    "nav",
    { "aria-label": "Navigation principale", className: "navigation" },
    children,
  );
}

function NavigationAction({ children, current, path }: NavigationPrimitiveProps) {
  return createElement(
    "a",
    {
      "aria-current": current ? "page" : undefined,
      className: current
        ? "navigation-link navigation-link-current"
        : "navigation-link",
      href: path,
    },
    children,
  );
}

function TextField({
  disabled,
  inputMode,
  label,
  onChange,
  secure,
  value,
}: TextFieldPrimitiveProps) {
  return createElement(
    "label",
    { className: "field" },
    createElement("span", { className: "field-label" }, label),
    createElement("input", {
      autoComplete: secure
        ? "current-password"
        : inputMode === "email"
          ? "email"
          : "off",
      className: "field-input",
      disabled,
      inputMode,
      onChange: (event) => onChange(event.currentTarget.value),
      type: secure ? "password" : inputMode,
      value,
    }),
  );
}

const WEB_UI_ENGINE: UiEngine = Object.freeze({
  ActionButton,
  Badge,
  Card,
  CardCopy,
  DisplayHeading,
  Eyebrow,
  FormBuilder: WebFormBuilder,
  IntroText,
  MetadataText,
  NavigationAction,
  NavigationGroup,
  Page,
  SectionHeading,
  StatusText,
  TextField,
});

interface WebFeatureRendererProps {
  readonly featureId: FeatureId;
}

export function WebFeatureRenderer({ featureId }: WebFeatureRendererProps) {
  return (
    <UiEngineProvider engine={WEB_UI_ENGINE}>
      <FeatureRoot featureId={featureId} />
    </UiEngineProvider>
  );
}
