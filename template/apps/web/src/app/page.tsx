import { buildProfileUiMeta } from "@starter/domain";
import { DisplayHeading, Eyebrow, IntroText, Page } from "@starter/ui-web";
import { ProfileCard } from "./profile-card";

export default function HomePage() {
  const uiMeta = buildProfileUiMeta(["profile:read", "profile:update"]);

  return (
    <Page>
      <Eyebrow>MESSANGA11 STARTER</Eyebrow>
      <DisplayHeading>Une base Web et Mobile, un seul domaine.</DisplayHeading>
      <IntroText>
        Next.js rend le Web. Expo rend le Mobile. Les contrats et politiques restent
        partagés dans le package domain.
      </IntroText>
      <ProfileCard uiMeta={uiMeta} />
    </Page>
  );
}
