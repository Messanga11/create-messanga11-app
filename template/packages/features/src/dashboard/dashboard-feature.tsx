import {
  Badge,
  Card,
  CardCopy,
  MetadataText,
  NavigationAction,
  SectionHeading,
} from "@starter/ui-engine";
import { FeatureShell } from "../shared/feature-shell";

const MODULES = [
  {
    id: "dashboard-auth",
    label: "Authentification",
    path: "/authentification",
  },
  { id: "dashboard-profile", label: "Profil", path: "/profil" },
  {
    id: "dashboard-notifications",
    label: "Notifications",
    path: "/notifications",
  },
  { id: "dashboard-team", label: "Gestion d’équipe", path: "/equipe" },
  { id: "dashboard-settings", label: "Paramètres", path: "/parametres" },
] as const;

export function DashboardFeature() {
  return (
    <FeatureShell
      active="dashboard"
      description="Accédez aux six modules demandés sans dupliquer leur logique entre Web et Mobile."
      title="Tableau de bord"
    >
      {MODULES.map((module) => (
        <Card key={module.id} labelledBy={module.id}>
          <CardCopy>
            <Badge>Module disponible</Badge>
            <SectionHeading id={module.id}>{module.label}</SectionHeading>
            <MetadataText>
              État local de démonstration, sans donnée fictive.
            </MetadataText>
          </CardCopy>
          <NavigationAction current={false} path={module.path}>
            Ouvrir
          </NavigationAction>
        </Card>
      ))}
    </FeatureShell>
  );
}
