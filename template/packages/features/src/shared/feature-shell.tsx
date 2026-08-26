import { AdminShell, DisplayHeading, Eyebrow, IntroText } from "@starter/ui-engine";
import type { ReactNode } from "react";
import type { ProductFeatureId } from "../feature-types";

interface FeatureShellProps {
  readonly active: ProductFeatureId;
  readonly children: ReactNode;
  readonly description: string;
  readonly showIntro?: boolean;
  readonly title: string;
}

const NAVIGATION_ITEMS = [
  { icon: "dashboard", id: "dashboard", label: "Dashboard", path: "/" },
  { icon: "orders", id: "orders", label: "Orders", path: "/orders" },
  { icon: "customers", id: "customers", label: "Customers", path: "/customers" },
  { icon: "products", id: "products", label: "Products", path: "/products" },
  { icon: "categories", id: "categories", label: "Categories", path: "/categories" },
  { icon: "stores", id: "stores", label: "Stores", path: "/stores" },
  { icon: "couriers", id: "couriers", label: "Couriers", path: "/couriers" },
  { icon: "invoices", id: "invoice", label: "Invoices", path: "/factures" },
  { icon: "forms", id: "form-builder", label: "FormBuilder", path: "/formulaire" },
  { icon: "team", id: "team", label: "Team", path: "/equipe" },
  {
    icon: "notifications",
    id: "notifications",
    label: "Notifications",
    path: "/notifications",
  },
  { icon: "settings", id: "settings", label: "Settings", path: "/parametres" },
  {
    icon: "authentication",
    id: "authentication",
    label: "Authentification",
    path: "/authentification",
  },
  { icon: "profile", id: "profile", label: "Profile", path: "/profil" },
] as const;

export function FeatureShell({
  active,
  children,
  description,
  showIntro = true,
  title,
}: FeatureShellProps) {
  return (
    <AdminShell active={active} navigation={NAVIGATION_ITEMS}>
      {showIntro ? <Eyebrow>MESSANGA11 DEMO</Eyebrow> : null}
      {showIntro ? <DisplayHeading>{title}</DisplayHeading> : null}
      {showIntro ? <IntroText>{description}</IntroText> : null}
      {children}
    </AdminShell>
  );
}
