"use client";

import {
  type ComponentType,
  createContext,
  createElement,
  type ReactNode,
  use,
} from "react";

export interface PrimitiveProps {
  readonly children: ReactNode;
}

export interface IdentifiedPrimitiveProps extends PrimitiveProps {
  readonly id: string;
}

export interface LabelledPrimitiveProps extends PrimitiveProps {
  readonly labelledBy: string;
}

export interface ActionPrimitiveProps extends PrimitiveProps {
  readonly disabled: boolean;
  readonly onPress: () => void;
}

export interface UiEngine {
  readonly ActionButton: ComponentType<ActionPrimitiveProps>;
  readonly Badge: ComponentType<PrimitiveProps>;
  readonly Card: ComponentType<LabelledPrimitiveProps>;
  readonly CardCopy: ComponentType<PrimitiveProps>;
  readonly DisplayHeading: ComponentType<PrimitiveProps>;
  readonly Eyebrow: ComponentType<PrimitiveProps>;
  readonly IntroText: ComponentType<PrimitiveProps>;
  readonly MetadataText: ComponentType<PrimitiveProps>;
  readonly Page: ComponentType<PrimitiveProps>;
  readonly SectionHeading: ComponentType<IdentifiedPrimitiveProps>;
  readonly StatusText: ComponentType<PrimitiveProps>;
}

interface UiEngineProviderProps extends PrimitiveProps {
  readonly engine: UiEngine;
}

const UiEngineContext = createContext<UiEngine | null>(null);

export function UiEngineProvider({ children, engine }: UiEngineProviderProps) {
  return createElement(UiEngineContext.Provider, { value: engine }, children);
}

export function Page(props: PrimitiveProps) {
  return createElement(useUiEngine().Page, props);
}

export function Eyebrow(props: PrimitiveProps) {
  return createElement(useUiEngine().Eyebrow, props);
}

export function DisplayHeading(props: PrimitiveProps) {
  return createElement(useUiEngine().DisplayHeading, props);
}

export function IntroText(props: PrimitiveProps) {
  return createElement(useUiEngine().IntroText, props);
}

export function Card(props: LabelledPrimitiveProps) {
  return createElement(useUiEngine().Card, props);
}

export function CardCopy(props: PrimitiveProps) {
  return createElement(useUiEngine().CardCopy, props);
}

export function Badge(props: PrimitiveProps) {
  return createElement(useUiEngine().Badge, props);
}

export function SectionHeading(props: IdentifiedPrimitiveProps) {
  return createElement(useUiEngine().SectionHeading, props);
}

export function MetadataText(props: PrimitiveProps) {
  return createElement(useUiEngine().MetadataText, props);
}

export function StatusText(props: PrimitiveProps) {
  return createElement(useUiEngine().StatusText, props);
}

export function ActionButton(props: ActionPrimitiveProps) {
  return createElement(useUiEngine().ActionButton, props);
}

function useUiEngine(): UiEngine {
  const engine = use(UiEngineContext);
  if (!engine) {
    throw new Error("A UiEngineProvider is required to render shared features.");
  }
  return engine;
}
