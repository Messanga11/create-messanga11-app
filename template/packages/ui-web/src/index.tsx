"use client";

import { type FeatureId, FeatureRoot } from "@starter/features";
import {
  type ActionPrimitiveProps,
  type AdminIconName,
  type AdminShellPrimitiveProps,
  type AnalyticsDashboardPrimitiveProps,
  type FeatureLayoutPrimitiveProps,
  type IdentifiedPrimitiveProps,
  isJsonValue,
  type LabelledPrimitiveProps,
  type NavigationPrimitiveProps,
  type PrimitiveProps,
  type ResourceListPrimitiveProps,
  type StatusTone,
  type TextFieldPrimitiveProps,
  type UiEngine,
  UiEngineProvider,
} from "@starter/ui-engine";
import { createElement, Fragment, type ReactNode } from "react";
import { WebFormBuilder } from "./form-builder";

function Page({ children }: PrimitiveProps) {
  return createElement("main", { className: "shell" }, children);
}

const ICON_PATHS: Readonly<Record<AdminIconName, string>> = {
  authentication: "M15 3h4v18h-4M10 17l5-5-5-5M15 12H3",
  categories:
    "M20.59 13.41 11 3.83V3H4v7h.83l9.58 9.59a2 2 0 0 0 2.82 0l3.36-3.36a2 2 0 0 0 0-2.82ZM7.5 7.5h.01",
  couriers:
    "M3 17h2a2 2 0 1 0 4 0h6a2 2 0 1 0 4 0h2v-6l-3-4h-4V4H3v13Zm11-8h3l2 3h-5V9Z",
  customers: "M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  dashboard: "M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z",
  forms: "M6 3h12v18H6zM9 8h6M9 12h6M9 16h4",
  invoices: "M6 2h9l4 4v16H6zM14 2v5h5M9 12h7M9 16h7",
  notifications: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  orders: "M6 7V5a6 6 0 0 1 12 0v2M3 7h18l-1 14H4L3 7Z",
  products: "M4 6h16M4 12h16M4 18h16",
  profile: "M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  settings:
    "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V20h-3v-.08a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 14.7a1.7 1.7 0 0 0-1.56-1H5.3v-3h.14A1.7 1.7 0 0 0 7 9.7a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06A1.7 1.7 0 0 0 10.66 6a1.7 1.7 0 0 0 1-1.56V4.3h3v.14a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1H21v3h-.08A1.7 1.7 0 0 0 19.4 15Z",
  stores: "M3 10h18l-2-6H5l-2 6Zm2 0v10h14V10M9 20v-6h6v6",
  team: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
};

function AdminIcon({ name }: Readonly<{ name: AdminIconName }>) {
  return (
    <svg aria-hidden="true" className="admin-icon" viewBox="0 0 24 24">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

function AdminShell({ active, children, navigation }: AdminShellPrimitiveProps) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <a aria-label="Refinefoods dashboard" className="admin-brand" href="/">
          <span aria-hidden="true" className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <span>REFINEFOODS</span>
        </a>
        <nav aria-label="Main navigation" className="admin-navigation">
          {navigation.map((item) => (
            <a
              aria-current={item.id === active ? "page" : undefined}
              className={
                item.id === active ? "admin-nav-link is-current" : "admin-nav-link"
              }
              href={item.path}
              key={item.id}
            >
              <AdminIcon name={item.icon} />
              <span className="admin-nav-label">{item.label}</span>
            </a>
          ))}
        </nav>
        <button
          className="sidebar-collapse"
          type="button"
          aria-label="Collapse navigation"
        >
          ‹
        </button>
      </aside>
      <div className="admin-workspace">
        <header className="admin-header">
          <label className="admin-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Global search"
              placeholder="Search by Store ID, E-mail, Keyword"
              type="search"
            />
            <kbd>/</kbd>
          </label>
          <div className="admin-account">
            <button className="header-button" type="button">
              English⌄
            </button>
            <button aria-label="Switch theme" className="theme-button" type="button">
              ◐
            </button>
            <span className="account-name">James Sullivan</span>
            <span aria-hidden="true" className="account-avatar">
              JS
            </span>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}

function AnalyticsDashboard({
  metrics,
  orders,
  period,
  timeline,
  trending,
}: AnalyticsDashboardPrimitiveProps) {
  return (
    <section className="analytics-dashboard">
      <div className="page-toolbar">
        <h1>Overview</h1>
        <button className="toolbar-button" type="button">
          {period}⌄
        </button>
      </div>
      <div className="metric-grid">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.id}>
            <div className="metric-header">
              <span className="metric-label">
                <span className="metric-symbol">◎</span>
                {metric.label}
              </span>
              <strong>
                {metric.value} <small>▲</small>
              </strong>
            </div>
            <MetricChart kind={metric.kind} values={metric.values} />
          </article>
        ))}
      </div>
      <div className="dashboard-middle-grid">
        <DashboardPanel className="map-panel" title="Delivery Map">
          <DeliveryMap />
        </DashboardPanel>
        <DashboardPanel title="Timeline">
          <ul className="timeline-list">
            {timeline.map((item) => (
              <li key={item.id}>
                <StatusPill tone={item.tone}>{item.status}</StatusPill>
                <strong>{item.id}</strong>
                <time>{item.age}</time>
              </li>
            ))}
          </ul>
        </DashboardPanel>
      </div>
      <div className="dashboard-bottom-grid">
        <DashboardPanel title="Recent Orders">
          <div className="recent-order-list">
            {orders.map((order) => (
              <div className="recent-order" key={order.id}>
                <strong>{order.id}</strong>
                <span className="recent-order-detail">
                  <b>{order.customer}</b>
                  <small>{order.address}</small>
                </span>
                <span className="recent-order-detail">
                  {order.products.map((product) => (
                    <small key={product}>{product}</small>
                  ))}
                </span>
                <b>{order.amount}</b>
                <button aria-label={`More actions for ${order.id}`} type="button">
                  ⋮
                </button>
              </div>
            ))}
          </div>
          <Pagination />
        </DashboardPanel>
        <DashboardPanel title="Trending Products">
          <ol className="trending-list">
            {trending.map((product, index) => (
              <li key={product.id}>
                <span className={`product-thumb product-thumb-${index + 1}`}>
                  <b>{index + 1}</b>
                </span>
                <span>
                  <strong>{product.name}</strong>
                  <small>{product.price}</small>
                  <small>
                    Ordered <b>{product.orders}</b> times
                  </small>
                </span>
              </li>
            ))}
          </ol>
        </DashboardPanel>
      </div>
    </section>
  );
}

function DashboardPanel({
  children,
  className = "",
  title,
}: Readonly<{ children: ReactNode; className?: string; title: string }>) {
  return (
    <section className={`dashboard-panel ${className}`}>
      <h2>
        <span>◉</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function MetricChart({
  kind,
  values,
}: Readonly<{ kind: "bar" | "line"; values: readonly number[] }>) {
  const max = Math.max(...values);
  const labels = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];
  if (kind === "bar") {
    return (
      <div className="bar-chart">
        <svg aria-label="Weekly activity" role="img" viewBox="0 0 300 120">
          {values.map((value, index) => {
            const height = Math.round((value / max) * 82);
            return (
              <rect
                height={height}
                key={labels[index]}
                rx="4"
                width="24"
                x={8 + index * 43}
                y={102 - height}
              />
            );
          })}
        </svg>
        <div className="chart-labels">
          {labels.map((label) => (
            <small key={label}>{label}</small>
          ))}
        </div>
      </div>
    );
  }
  const points = values
    .map((value, index) => `${index * 50},${105 - (value / max) * 85}`)
    .join(" ");
  return (
    <div className="line-chart">
      <svg aria-label="Revenue trend" role="img" viewBox="0 0 300 120">
        <defs>
          <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#4389ee" stopOpacity=".28" />
            <stop offset="1" stopColor="#4389ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill="url(#chart-fill)" points={`0,120 ${points} 300,120`} />
        <polyline fill="none" points={points} stroke="#4389ee" strokeWidth="2" />
      </svg>
      <div className="chart-labels">
        {labels.map((label) => (
          <small key={label}>{label}</small>
        ))}
      </div>
    </div>
  );
}

const MAP_MARKERS = [
  "12% 75%",
  "21% 68%",
  "30% 62%",
  "39% 70%",
  "48% 56%",
  "58% 72%",
  "68% 49%",
  "77% 64%",
  "87% 52%",
] as const;

function DeliveryMap() {
  return (
    <div className="delivery-map">
      <span className="map-city">New York</span>
      {MAP_MARKERS.map((position, index) => (
        <i className={`map-marker map-marker-${index + 1}`} key={position}>
          <AdminIcon name="couriers" />
        </i>
      ))}
    </div>
  );
}

function StatusPill({
  children,
  tone,
}: Readonly<{ children: ReactNode; tone: StatusTone }>) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}

function Pagination() {
  return (
    <nav aria-label="Pagination" className="pagination">
      <button disabled type="button">
        ‹
      </button>
      {[1, 2, 3, 4, 5].map((page) => (
        <button className={page === 1 ? "is-current" : ""} key={page} type="button">
          {page}
        </button>
      ))}
      <span>•••</span>
      <button type="button">26</button>
      <button type="button">›</button>
    </nav>
  );
}

function ResourceList({
  columns,
  emptyLabel,
  primaryAction,
  rows,
  title,
  viewModes,
}: ResourceListPrimitiveProps) {
  return (
    <section className="resource-page">
      <div className="page-toolbar">
        <h1>{title}</h1>
        <div className="resource-actions">
          {viewModes ? (
            <fieldset className="view-switch">
              <legend className="sr-only">View mode</legend>
              <button className="is-current" type="button">
                ☷
              </button>
              <button type="button">⊞</button>
            </fieldset>
          ) : null}
          {primaryAction ? (
            <button className="primary-toolbar-button" type="button">
              ＋ {primaryAction}
            </button>
          ) : null}
        </div>
      </div>
      <div className="resource-table-wrap">
        <table className="resource-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.id} scope="col">
                  {column.label}
                  <button aria-label={`Filter ${column.label}`} type="button">
                    ⌕
                  </button>
                </th>
              ))}
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="empty-table" colSpan={columns.length + 1}>
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => {
                    const cell = row.cells[column.id];
                    return (
                      <td key={column.id}>
                        {cell?.tone ? (
                          <StatusPill tone={cell.tone}>{cell.value}</StatusPill>
                        ) : (
                          <span className="resource-cell">
                            <b>{cell?.value ?? "—"}</b>
                            {cell?.secondary ? <small>{cell.secondary}</small> : null}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td>
                    <button
                      aria-label={`More actions for ${row.id}`}
                      className="more-button"
                      type="button"
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination />
    </section>
  );
}

function FeatureLayout({ children, layout }: FeatureLayoutPrimitiveProps) {
  if (layout !== "application.shell") {
    throw new Error(`Unsupported Web feature layout: ${layout}`);
  }
  return createElement(Fragment, null, children);
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
      type: secure ? "password" : inputMode === "decimal" ? "number" : inputMode,
      ...(inputMode === "decimal" ? { min: "0", step: "0.01" } : {}),
      value,
    }),
  );
}

async function executeMutation(request: Parameters<UiEngine["executeMutation"]>[0]) {
  const response = await fetch(
    `/api/features/${encodeURIComponent(request.featureId)}/${encodeURIComponent(request.operationId)}`,
    {
      body: JSON.stringify(request.input),
      headers: {
        "content-type": "application/json",
        "x-idempotency-key": crypto.randomUUID(),
      },
      method: "POST",
    },
  );
  if (!response.ok) throw new Error("L’opération a échoué.");
  const result: unknown = await response.json();
  if (!isJsonValue(result)) throw new Error("La réponse est invalide.");
  return result;
}

const WEB_UI_ENGINE: UiEngine = Object.freeze({
  AdminShell,
  AnalyticsDashboard,
  ActionButton,
  Badge,
  Card,
  CardCopy,
  DisplayHeading,
  Eyebrow,
  FeatureLayout,
  FormBuilder: WebFormBuilder,
  IntroText,
  MetadataText,
  NavigationAction,
  NavigationGroup,
  Page,
  ResourceList,
  SectionHeading,
  StatusText,
  TextField,
  executeMutation,
});

interface WebFeatureRendererProps {
  readonly featureId: FeatureId;
  readonly pageId?: string;
}

export function WebFeatureRenderer({ featureId, pageId }: WebFeatureRendererProps) {
  return (
    <UiEngineProvider engine={WEB_UI_ENGINE}>
      <FeatureRoot featureId={featureId} {...(pageId ? { pageId } : {})} />
    </UiEngineProvider>
  );
}
