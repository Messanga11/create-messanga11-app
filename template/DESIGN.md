# Design System: __PROJECT_NAME__

This file is the human source of truth for product appearance and interaction.
`@messanga11/core/design` owns the validated vocabulary and defaults. Project
overrides live in `packages/design-system/design.config.json`. Read this file
before changing UI in either application.

## 1. Visual theme

The default atmosphere is restrained, warm and product-focused: balanced density,
clear asymmetric hierarchy and quiet motion. Interfaces should feel intentional,
not decorative. Use negative space before adding containers or visual effects.

## 2. Token configuration

The palette uses warm neutrals and one forest accent:

- **Canvas** (`#f4f2ed`) — application background.
- **Surface** (`#fffef9`) — elevated or grouped content.
- **Ink** (`#171714`) — primary text and primary controls; never pure black.
- **Body** (`#57534b`) — paragraphs and supporting copy.
- **Muted** (`#68645c`) — metadata; it must still meet contrast requirements.
- **Border** (`#d8d4ca`) — structural separators.
- **Accent** (`#2d6a4f`) — the only brand accent, used for focus and active states.
- **Danger** (`#a33a32`) — destructive feedback only, never branding.

To configure the system:

1. Edit only the values that differ in `packages/design-system/design.config.json`.
2. Keep each name tied to purpose, not a visual hue such as `green500`.
3. Run `npm run design:sync` to regenerate the Web variables.
4. Run `npm test && npm run typecheck` to verify Web/Native parity.

Missing values inherit from Core. Unknown groups, unknown token names, invalid hex
colors and negative measurements fail validation. Never edit
`packages/design-system/web.css` directly; it is generated.

Example override:

```json
{
  "color": { "accent": "#315d55" },
  "radius": { "control": 10 },
  "spacing": { "md": 28 }
}
```

## 3. Using tokens

Web components consume CSS variables after the root layout imports
`@starter/design-system/web.css`:

```css
.control {
  border-radius: var(--ds-radius-control);
  background: var(--ds-color-accent);
  color: var(--ds-color-accent-contrast);
}
```

Shared features import stable primitives from `@starter/ui-engine`. They never
import a renderer or write platform JSX directly:

```tsx
import { ActionButton, Card, SectionHeading } from "@starter/ui-engine";

<Card labelledBy="account-title">
  <SectionHeading id="account-title">Compte</SectionHeading>
  <ActionButton onPress={save}>Enregistrer</ActionButton>
</Card>;
```

If a semantic primitive is missing, define its narrow contract in `ui-engine`, then
implement it in both `ui-web` and `ui-native`. Do not expose DOM or React Native
attributes to feature code.

Native components import the same JSON-backed values:

```ts
import { designTokens } from "@starter/design-system";

const styles = StyleSheet.create({
  control: {
    backgroundColor: designTokens.color.accent,
    borderRadius: designTokens.radius.control,
  },
});
```

Share feature JSX only through `ui-engine` primitives. Never share DOM or React
Native props. Platform semantics and styles remain isolated in `ui-web` and
`ui-native`; `apps/web` and `apps/mobile` only select an engine.

## 4. Shared feature architecture

- `packages/features` owns copy, composition, interaction state, `uiMeta` projection
  and action wiring exactly once.
- `packages/ui-engine` owns stable primitive contracts and the injected provider.
- `packages/ui-web` maps those contracts to accessible browser semantics.
- `packages/ui-native` maps the same contracts to accessible Native primitives.
- `@messanga11/core/forms` owns JSON-safe field, step and validation contracts.
- `@messanga11/formbuilder` owns TanStack Form orchestration but renders no
  platform primitive. `ui-web` and `ui-native` inject the renderers.
- Refine.dev is confined to `ui-web` through `@messanga11/adapter-refine`; it is
  never imported by shared features or the Native engine.
- `packages/features/routes.config.json` declares which shared feature each physical
  Web and Mobile route renders. It also owns the exact Web title, description,
  canonical path and indexing decision; the generator never infers product pages.
- `apps/*` contain framework layouts and generated route adapters that pass only a
  `featureId` to the selected engine renderer.

Never branch on platform inside a feature. When a capability differs, express a
semantic primitive or optional engine capability and implement the difference in
the two renderers.

Complex forms follow the same rule. The feature declares `FormDefinition` and
default JSON values. The engines own OTP cells, country lookup, document picking,
focus restoration, date-range projection and accessible control semantics. File
definitions contain only metadata constraints; browser `File` and Expo document
picker results remain inside their respective engines.

### Adding an actual page

1. Implement the complete shared screen in `packages/features` with
   `@starter/ui-engine` primitives.
2. Add its identifier to `FEATURE_IDS` and map it in `FeatureRoot`.
3. Add exactly the corresponding Web and Mobile paths to
   `packages/features/routes.config.json`, including truthful Web metadata.
4. Save the registry while either development server is running: the route is
   generated and hot-reloaded immediately. Use `npm run routes:generate` only for
   an explicit one-shot generation.

The generator creates physical App Router and Expo Router files, plus the Web
canonical metadata, robots directives and sitemap entries. Do not add SEO claims,
locales, Open Graph images, JSON-LD entities or routes that are not present in the
product brief. Configure the public origin with `NEXT_PUBLIC_SITE_URL`; production
must not use the localhost fallback.

The watcher supports editors that save by replacing the file atomically. Rapid
saves are debounced, a change received during generation is queued, and invalid
intermediate JSON keeps the last valid pages active until the next valid save.

## 5. Typography

- Use Geist for product UI when the font asset is installed, with Avenir Next and
  platform sans-serif fallbacks during bootstrap.
- Use weight and color for hierarchy before increasing size.
- Keep body copy at least 16px on Web and 16 logical pixels on Native, with relaxed
  line height and a maximum readable line length of 65 characters.
- Use the mono token only for code, identifiers, timestamps and dense numbers.
- Do not use Inter, generic serif fonts, oversized marketing headlines or gradient
  text in product screens.

## 6. Components and states

- Buttons have one primary treatment, a minimum 44px target and tactile pressed
  feedback. Disabled controls remain perceivable when a denial reason is useful.
- Inputs place the label above, helper text below and inline error below the field.
- Cards are reserved for real grouping or elevation; use spacing and dividers first.
- Loading placeholders match the final geometry. Avoid generic spinners where a
  skeleton communicates structure.
- Every data view implements loading, stale, error, empty, submitting, success and
  denied states where applicable.
- Destructive actions require confirmation and restore focus when the dialog closes.

## 7. Layout and responsiveness

- Start mobile-first. Multi-column layouts collapse below 768px without horizontal
  overflow.
- Prefer CSS Grid for Web page structure and native layout primitives for Expo.
- Keep content in a bounded readable region; do not overlap text and imagery.
- Avoid three identical cards in a row. Use hierarchy, offset grids or clear lists.
- Interactive elements keep at least a 44px target on both platforms.

## 8. Motion and accessibility

- Animate only `transform` and `opacity`; use restrained non-linear timing.
- Respect `prefers-reduced-motion` on Web and the platform reduce-motion setting on
  Native. Motion must never be required to understand state.
- Preserve visible keyboard focus, semantic roles, labels, live announcements and
  focus restoration.
- Never encode status by color alone. Pair it with text, iconography or shape.
- Haptics are optional enhancement on Native, never the only feedback channel.

## 9. Banned patterns

No pure black, neon glow, purple AI gradients, excessive shadows, emoji decoration,
custom cursors, overlapping content, inaccessible icon-only controls, generic names,
fake metrics or filler phrases such as “Elevate”, “Seamless” and “Next-Gen”. Never
introduce raw visual values when a semantic token already represents the purpose.
