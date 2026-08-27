import { designTokens } from "@starter/design-system";
import { type FeatureId, FeatureRoot } from "@starter/features";
import {
  type ActionPrimitiveProps,
  type AdminShellPrimitiveProps,
  type AnalyticsDashboardPrimitiveProps,
  type FeatureLayoutPrimitiveProps,
  type IdentifiedPrimitiveProps,
  isJsonValue,
  type LabelledPrimitiveProps,
  type NavigationPrimitiveProps,
  type PrimitiveProps,
  type ResourceListPrimitiveProps,
  type TextFieldPrimitiveProps,
  type UiEngine,
  UiEngineProvider,
} from "@starter/ui-engine";
import { type Href, Link } from "expo-router";
import {
  Pressable,
  type PressableStateCallbackType,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  NativeAdminShell,
  NativeAnalyticsDashboard,
  NativeResourceList,
} from "./admin";
import { NativeFormBuilder } from "./form-builder";

function Page({ children }: PrimitiveProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.shell}>{children}</ScrollView>
    </SafeAreaView>
  );
}

function FeatureLayout({ children, layout }: FeatureLayoutPrimitiveProps) {
  if (layout !== "application.shell") {
    throw new Error(`Unsupported Native feature layout: ${layout}`);
  }
  return children;
}

function AdminShell(props: AdminShellPrimitiveProps) {
  return <NativeAdminShell {...props} />;
}

function AnalyticsDashboard(props: AnalyticsDashboardPrimitiveProps) {
  return <NativeAnalyticsDashboard {...props} />;
}

function ResourceList(props: ResourceListPrimitiveProps) {
  return <NativeResourceList {...props} />;
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

const CURRENT_ACCESSIBILITY_STATE = { selected: true } as const;
const DEFAULT_ACCESSIBILITY_STATE = { selected: false } as const;

function NavigationGroup({ children }: PrimitiveProps) {
  return <View style={styles.navigation}>{children}</View>;
}

function NavigationAction({ children, current, path }: NavigationPrimitiveProps) {
  return (
    <Link asChild href={path as Href}>
      <Pressable
        accessibilityRole="link"
        accessibilityState={
          current ? CURRENT_ACCESSIBILITY_STATE : DEFAULT_ACCESSIBILITY_STATE
        }
        style={current ? styles.currentNavigationLink : styles.navigationLink}
      >
        <Text style={current ? styles.currentNavigationText : styles.navigationText}>
          {children}
        </Text>
      </Pressable>
    </Link>
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
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        autoCapitalize={
          inputMode === "email" || inputMode === "decimal" ? "none" : "sentences"
        }
        editable={!disabled}
        inputMode={inputMode}
        onChangeText={onChange}
        secureTextEntry={secure}
        style={styles.fieldInput}
        value={value}
      />
    </View>
  );
}

async function executeOperation(request: Parameters<UiEngine["executeOperation"]>[0]) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";
  const response = await fetch(
    `${apiUrl}/api/features/${encodeURIComponent(request.featureId)}/${encodeURIComponent(request.operationId)}`,
    {
      body: JSON.stringify(request.input),
      headers: {
        "content-type": "application/json",
        "x-idempotency-key": crypto.randomUUID(),
      },
      method: request.method,
    },
  );
  if (!response.ok) throw new Error("L’opération a échoué.");
  const result: unknown = await response.json();
  if (!isJsonValue(result)) throw new Error("La réponse est invalide.");
  return result;
}

function executeMutation(request: Parameters<UiEngine["executeMutation"]>[0]) {
  return executeOperation({ ...request, method: "POST" });
}

function resolveButtonStyle(state: PressableStateCallbackType) {
  return state.pressed ? styles.pressedButton : styles.button;
}

const NATIVE_UI_ENGINE: UiEngine = Object.freeze({
  AdminShell,
  AnalyticsDashboard,
  ActionButton,
  Badge,
  Card,
  CardCopy,
  DisplayHeading,
  Eyebrow,
  FeatureLayout,
  FormBuilder: NativeFormBuilder,
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
  executeOperation,
});

interface NativeFeatureRendererProps {
  readonly featureId: FeatureId;
  readonly pageId?: string;
}

export function NativeFeatureRenderer({
  featureId,
  pageId,
}: NativeFeatureRendererProps) {
  return (
    <UiEngineProvider engine={NATIVE_UI_ENGINE}>
      <FeatureRoot featureId={featureId} {...(pageId ? { pageId } : {})} />
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
  currentNavigationLink: {
    backgroundColor: designTokens.color.ink,
    borderColor: designTokens.color.ink,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: designTokens.spacing.sm,
  },
  currentNavigationText: {
    color: designTokens.color.accentContrast,
    fontWeight: "700",
  },
  field: { gap: designTokens.spacing.xs, marginTop: designTokens.spacing.sm },
  fieldInput: {
    backgroundColor: designTokens.color.surface,
    borderColor: designTokens.color.border,
    borderRadius: designTokens.radius.control,
    borderWidth: 1,
    color: designTokens.color.ink,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: designTokens.spacing.sm,
  },
  fieldLabel: { color: designTokens.color.ink, fontWeight: "700" },
  lede: {
    color: designTokens.color.body,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 16,
  },
  meta: { color: designTokens.color.muted, marginTop: designTokens.spacing.xs },
  navigation: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.spacing.xs,
    marginBottom: designTokens.spacing.lg,
  },
  navigationLink: {
    borderColor: designTokens.color.border,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: designTokens.spacing.sm,
  },
  navigationText: { color: designTokens.color.body, fontWeight: "700" },
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
    flexGrow: 1,
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
