import { buildProfileUiMeta } from "@starter/domain";
import { ProfileCard } from "./profile-card";

export default function HomePage() {
  const uiMeta = buildProfileUiMeta(["profile:read", "profile:update"]);

  return (
    <main className="shell">
      <p className="eyebrow">MESSANGA11 STARTER</p>
      <h1>Une base Web et Mobile, un seul domaine.</h1>
      <p className="lede">
        Next.js rend le Web. Expo rend le Mobile. Les contrats et politiques restent
        partagés dans le package domain.
      </p>
      <ProfileCard uiMeta={uiMeta} />
    </main>
  );
}
