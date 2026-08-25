"use client";

import { FeatureRoot } from "@starter/features";
import {
  type ActionPrimitiveProps,
  type IdentifiedPrimitiveProps,
  type LabelledPrimitiveProps,
  type PrimitiveProps,
  type UiEngine,
  UiEngineProvider,
} from "@starter/ui-engine";
import { createElement } from "react";

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

const WEB_UI_ENGINE: UiEngine = Object.freeze({
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
});

export function WebEngineRenderer() {
  return (
    <UiEngineProvider engine={WEB_UI_ENGINE}>
      <FeatureRoot />
    </UiEngineProvider>
  );
}
