"use client";

import type { JsonValue } from "@messanga11/core";
import type { FormDefinition, FormValues } from "@messanga11/core/forms";
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

export interface NavigationPrimitiveProps extends PrimitiveProps {
  readonly current: boolean;
  readonly path: string;
}

export type AdminIconName =
  | "authentication"
  | "categories"
  | "couriers"
  | "customers"
  | "dashboard"
  | "forms"
  | "invoices"
  | "notifications"
  | "orders"
  | "products"
  | "profile"
  | "settings"
  | "stores"
  | "team";

export interface AdminNavigationItem {
  readonly icon: AdminIconName;
  readonly id: string;
  readonly label: string;
  readonly path: string;
}

export interface AdminShellPrimitiveProps extends PrimitiveProps {
  readonly active: string;
  readonly navigation: readonly AdminNavigationItem[];
}

export type DashboardMetricKind = "bar" | "line";

export interface DashboardMetric {
  readonly id: string;
  readonly kind: DashboardMetricKind;
  readonly label: string;
  readonly trend: string;
  readonly value: string;
  readonly values: readonly number[];
}

export type StatusTone = "danger" | "info" | "neutral" | "success" | "warning";

export interface TimelineItem {
  readonly age: string;
  readonly id: string;
  readonly status: string;
  readonly tone: StatusTone;
}

export interface RecentOrder {
  readonly address: string;
  readonly amount: string;
  readonly customer: string;
  readonly id: string;
  readonly products: readonly string[];
}

export interface TrendingProduct {
  readonly id: string;
  readonly name: string;
  readonly orders: number;
  readonly price: string;
}

export interface AnalyticsDashboardPrimitiveProps {
  readonly metrics: readonly DashboardMetric[];
  readonly orders: readonly RecentOrder[];
  readonly period: string;
  readonly timeline: readonly TimelineItem[];
  readonly trending: readonly TrendingProduct[];
}

export interface ResourceColumn {
  readonly id: string;
  readonly label: string;
}

export interface ResourceCell {
  readonly secondary?: string;
  readonly tone?: StatusTone;
  readonly value: string;
}

export interface ResourceRow {
  readonly cells: Readonly<Record<string, ResourceCell>>;
  readonly id: string;
}

export interface ResourceListPrimitiveProps {
  readonly columns: readonly ResourceColumn[];
  readonly emptyLabel: string;
  readonly primaryAction?: string;
  readonly rows: readonly ResourceRow[];
  readonly title: string;
  readonly viewModes?: boolean;
}

export interface TextFieldPrimitiveProps {
  readonly disabled: boolean;
  readonly inputMode: "decimal" | "email" | "text";
  readonly label: string;
  readonly onChange: (value: string) => void;
  readonly secure: boolean;
  readonly value: string;
}

export interface FeatureMutationRequest {
  readonly featureId: string;
  readonly input: JsonValue;
  readonly operationId: string;
}

export type FeatureMutationExecutor = (
  request: FeatureMutationRequest,
) => Promise<JsonValue>;

export interface FormBuilderPrimitiveProps {
  readonly defaultValues: FormValues;
  readonly definition: FormDefinition;
  readonly featureId: string;
  readonly operationId: string;
}

export interface FeatureLayoutPrimitiveProps extends PrimitiveProps {
  readonly layout: string;
  readonly properties: Readonly<Record<string, JsonValue>>;
}

export interface UiEngine {
  readonly AdminShell: ComponentType<AdminShellPrimitiveProps>;
  readonly AnalyticsDashboard: ComponentType<AnalyticsDashboardPrimitiveProps>;
  readonly ActionButton: ComponentType<ActionPrimitiveProps>;
  readonly Badge: ComponentType<PrimitiveProps>;
  readonly Card: ComponentType<LabelledPrimitiveProps>;
  readonly CardCopy: ComponentType<PrimitiveProps>;
  readonly DisplayHeading: ComponentType<PrimitiveProps>;
  readonly Eyebrow: ComponentType<PrimitiveProps>;
  readonly FeatureLayout: ComponentType<FeatureLayoutPrimitiveProps>;
  readonly FormBuilder: ComponentType<FormBuilderPrimitiveProps>;
  readonly IntroText: ComponentType<PrimitiveProps>;
  readonly MetadataText: ComponentType<PrimitiveProps>;
  readonly NavigationAction: ComponentType<NavigationPrimitiveProps>;
  readonly NavigationGroup: ComponentType<PrimitiveProps>;
  readonly Page: ComponentType<PrimitiveProps>;
  readonly ResourceList: ComponentType<ResourceListPrimitiveProps>;
  readonly SectionHeading: ComponentType<IdentifiedPrimitiveProps>;
  readonly StatusText: ComponentType<PrimitiveProps>;
  readonly TextField: ComponentType<TextFieldPrimitiveProps>;
  readonly executeMutation: FeatureMutationExecutor;
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

export function AdminShell(props: AdminShellPrimitiveProps) {
  return createElement(useUiEngine().AdminShell, props);
}

export function AnalyticsDashboard(props: AnalyticsDashboardPrimitiveProps) {
  return createElement(useUiEngine().AnalyticsDashboard, props);
}

export function ResourceList(props: ResourceListPrimitiveProps) {
  return createElement(useUiEngine().ResourceList, props);
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

export function NavigationGroup(props: PrimitiveProps) {
  return createElement(useUiEngine().NavigationGroup, props);
}

export function NavigationAction(props: NavigationPrimitiveProps) {
  return createElement(useUiEngine().NavigationAction, props);
}

export function TextField(props: TextFieldPrimitiveProps) {
  return createElement(useUiEngine().TextField, props);
}

export function ActionButton(props: ActionPrimitiveProps) {
  return createElement(useUiEngine().ActionButton, props);
}

export function FormBuilder(props: FormBuilderPrimitiveProps) {
  return createElement(useUiEngine().FormBuilder, props);
}

export function FeatureLayout(props: FeatureLayoutPrimitiveProps) {
  return createElement(useUiEngine().FeatureLayout, props);
}

export function useFeatureMutation(): FeatureMutationExecutor {
  return useUiEngine().executeMutation;
}

export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === "boolean" || typeof value === "string")
    return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value !== "object") return false;
  return Object.values(value).every(isJsonValue);
}

function useUiEngine(): UiEngine {
  const engine = use(UiEngineContext);
  if (!engine) {
    throw new Error("A UiEngineProvider is required to render shared features.");
  }
  return engine;
}
