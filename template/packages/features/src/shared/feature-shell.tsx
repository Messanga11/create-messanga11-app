import {
  DisplayHeading,
  Eyebrow,
  IntroText,
  NavigationAction,
  NavigationGroup,
  Page,
} from "@starter/ui-engine";
import type { ReactNode } from "react";
import type { ProductFeatureId } from "../feature-types";

interface FeatureShellProps {
  readonly active: ProductFeatureId;
  readonly children: ReactNode;
  readonly description: string;
  readonly title: string;
}

const NAVIGATION_ITEMS = [
  { id: "dashboard", label: "Tableau de bord", path: "/" },
  { id: "form-builder", label: "FormBuilder", path: "/formulaire" },
  {
    id: "authentication",
    label: "Authentification",
    path: "/authentification",
  },
  { id: "profile", label: "Profil", path: "/profil" },
  { id: "notifications", label: "Notifications", path: "/notifications" },
  { id: "team", label: "Équipe", path: "/equipe" },
  { id: "settings", label: "Paramètres", path: "/parametres" },
] as const;

export function FeatureShell({
  active,
  children,
  description,
  title,
}: FeatureShellProps) {
  return (
    <Page>
      <NavigationGroup>
        {NAVIGATION_ITEMS.map((item) => (
          <NavigationAction current={item.id === active} key={item.id} path={item.path}>
            {item.label}
          </NavigationAction>
        ))}
      </NavigationGroup>
      <Eyebrow>MESSANGA11 DEMO</Eyebrow>
      <DisplayHeading>{title}</DisplayHeading>
      <IntroText>{description}</IntroText>
      {children}
    </Page>
  );
}
