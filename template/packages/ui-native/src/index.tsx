import { designTokens } from "@starter/design-system";
import { type FeatureId, FeatureRoot } from "@starter/features";
import {
  type ActionPrimitiveProps,
  type IdentifiedPrimitiveProps,
  type LabelledPrimitiveProps,
  type PrimitiveProps,
  type UiEngine,
  UiEngineProvider,
} from "@starter/ui-engine";
import {
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function Page({ children }: PrimitiveProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>{children}</View>
    </SafeAreaView>
  );
}

function Eyebrow({ children }: PrimitiveProps) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

function DisplayHeading({ children }: PrimitiveProps) {
  return (
    <Text accessibilityRole="header" style={styles.title}>
      {children}
    </Text>
  );
}

function IntroText({ children }: PrimitiveProps) {
  return <Text style={styles.lede}>{children}</Text>;
}

function Card({ children, labelledBy }: LabelledPrimitiveProps) {
  return (
    <View accessibilityLabelledBy={labelledBy} style={styles.card}>
      {children}
    </View>
  );
}

function CardCopy({ children }: PrimitiveProps) {
  return <View>{children}</View>;
}

function Badge({ children }: PrimitiveProps) {
  return <Text style={styles.badge}>{children}</Text>;
}

function SectionHeading({ children, id }: IdentifiedPrimitiveProps) {
  return (
    <Text accessibilityRole="header" nativeID={id} style={styles.cardTitle}>
      {children}
    </Text>
  );
}

function MetadataText({ children }: PrimitiveProps) {
  return <Text style={styles.meta}>{children}</Text>;
}

function StatusText({ children }: PrimitiveProps) {
  return (
    <Text accessibilityLiveRegion="polite" style={styles.status}>
      {children}
    </Text>
  );
}

function ActionButton({ children, disabled, onPress }: ActionPrimitiveProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={disabled ? styles.disabledButton : resolveButtonStyle}
    >
      <Text style={styles.buttonLabel}>{children}</Text>
    </Pressable>
  );
}

function resolveButtonStyle(state: PressableStateCallbackType) {
  return state.pressed ? styles.pressedButton : styles.button;
}

const NATIVE_UI_ENGINE: UiEngine = Object.freeze({
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

interface NativeFeatureRendererProps {
  readonly featureId: FeatureId;
}

export function NativeFeatureRenderer({ featureId }: NativeFeatureRendererProps) {
  return (
    <UiEngineProvider engine={NATIVE_UI_ENGINE}>
      <FeatureRoot featureId={featureId} />
    </UiEngineProvider>
  );
}

const styles = StyleSheet.create({
  badge: {
    color: designTokens.color.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  button: {
    alignItems: "center",
    backgroundColor: designTokens.color.ink,
    borderRadius: designTokens.radius.pill,
    justifyContent: "center",
    marginTop: designTokens.spacing.md,
    minHeight: 50,
    paddingHorizontal: 20,
  },
  buttonLabel: {
    color: designTokens.color.accentContrast,
    fontSize: 16,
    fontWeight: "700",
  },
  card: {
    backgroundColor: designTokens.color.surface,
    borderColor: designTokens.color.border,
    borderRadius: designTokens.radius.card,
    borderWidth: 1,
    marginTop: designTokens.spacing.lg,
    padding: designTokens.spacing.md,
  },
  cardTitle: {
    color: designTokens.color.ink,
    fontSize: 23,
    fontWeight: "700",
    marginTop: designTokens.spacing.sm,
  },
  disabledButton: {
    alignItems: "center",
    backgroundColor: designTokens.color.ink,
    borderRadius: designTokens.radius.pill,
    justifyContent: "center",
    marginTop: designTokens.spacing.md,
    minHeight: 50,
    opacity: 0.45,
    paddingHorizontal: 20,
  },
  eyebrow: {
    color: designTokens.color.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  lede: {
    color: designTokens.color.body,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 16,
  },
  meta: { color: designTokens.color.muted, marginTop: designTokens.spacing.xs },
  pressedButton: {
    alignItems: "center",
    backgroundColor: designTokens.color.ink,
    borderRadius: designTokens.radius.pill,
    justifyContent: "center",
    marginTop: designTokens.spacing.md,
    minHeight: 50,
    opacity: 0.82,
    paddingHorizontal: 20,
  },
  safeArea: { backgroundColor: designTokens.color.canvas, flex: 1 },
  shell: {
    flex: 1,
    paddingHorizontal: designTokens.spacing.md,
    paddingTop: 36,
  },
  status: { color: designTokens.color.body, marginTop: 18, minHeight: 22 },
  title: {
    color: designTokens.color.ink,
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -2,
    lineHeight: 46,
    marginTop: 10,
  },
});
