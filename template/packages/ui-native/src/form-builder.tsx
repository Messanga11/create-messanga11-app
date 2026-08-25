import type { JsonValue } from "@messanga11/core";
import {
  type FormFieldRenderContext,
  type FormRenderContext,
  type FormRenderer,
  FormBuilder as HeadlessFormBuilder,
} from "@messanga11/formbuilder";
import { designTokens } from "@starter/design-system";
import type { FormBuilderPrimitiveProps } from "@starter/ui-engine";
import * as DocumentPicker from "expo-document-picker";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const COUNTRIES = [
  { labelKey: "Cameroun", value: "CM" },
  { labelKey: "France", value: "FR" },
  { labelKey: "Sénégal", value: "SN" },
] as const;

export function NativeFormBuilder(props: FormBuilderPrimitiveProps) {
  return (
    <HeadlessFormBuilder
      defaultValues={props.defaultValues}
      definition={props.definition}
      onSubmit={(values) => submit(props.featureId, props.operationId, values)}
      renderer={NATIVE_FORM_RENDERER}
    />
  );
}

const NATIVE_FORM_RENDERER: FormRenderer = {
  field: renderField,
  form: renderForm,
};

function renderForm(context: FormRenderContext) {
  const step = context.definition.steps[context.stepIndex];
  if (!step) return null;
  return (
    <View style={styles.form}>
      <Text style={styles.progress}>
        Étape {context.stepIndex + 1} sur {context.definition.steps.length}
      </Text>
      <Text accessibilityRole="header" style={styles.heading}>
        {step.titleKey}
      </Text>
      {step.descriptionKey ? (
        <Text style={styles.copy}>{step.descriptionKey}</Text>
      ) : null}
      {step.id === "review" ? (
        <Review context={context} />
      ) : (
        step.fields.map((field) => (
          <View key={field.id}>{context.renderField(field)}</View>
        ))
      )}
      {context.issues.length > 0 ? (
        <Text accessibilityLiveRegion="assertive" style={styles.error}>
          Corrigez les champs signalés.
        </Text>
      ) : null}
      <View style={styles.actions}>
        {context.canGoBack ? (
          <Action label="Retour" onPress={context.goBack} secondary />
        ) : (
          <View />
        )}
        {context.canGoNext ? (
          <Action label="Continuer" onPress={context.goNext} />
        ) : (
          <Action
            disabled={context.status === "submitting"}
            label={
              context.status === "submitting"
                ? "Enregistrement…"
                : context.definition.submitLabelKey
            }
            onPress={context.submit}
          />
        )}
      </View>
      {context.status === "succeeded" ? (
        <Text accessibilityLiveRegion="polite" style={styles.success}>
          Configuration enregistrée.
        </Text>
      ) : null}
    </View>
  );
}

function renderField(context: FormFieldRenderContext) {
  const field = context.field;
  if (["select", "multi-select", "async-select"].includes(field.kind))
    return <OptionsField context={context} />;
  if (field.kind === "repeater") return <RepeaterField context={context} />;
  if (field.kind === "file") return <FileField context={context} />;
  if (field.kind === "phone" || field.kind === "date-range")
    return <ObjectField context={context} />;
  return <SimpleField context={context} />;
}

function Frame({
  children,
  context,
}: Readonly<{ children: React.ReactNode; context: FormFieldRenderContext }>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{context.field.labelKey}</Text>
      {children}
      {context.issues.map((issue) => (
        <Text key={issue.code} style={styles.error}>
          {issue.messageKey}
        </Text>
      ))}
    </View>
  );
}

function SimpleField({ context }: Readonly<{ context: FormFieldRenderContext }>) {
  return (
    <Frame context={context}>
      <TextInput
        accessibilityLabel={context.field.labelKey}
        keyboardType={
          context.field.kind === "email"
            ? "email-address"
            : context.field.kind === "otp"
              ? "number-pad"
              : "default"
        }
        maxLength={context.field.kind === "otp" ? 6 : undefined}
        onChangeText={context.setValue}
        secureTextEntry={context.field.kind === "password"}
        style={styles.input}
        value={readString(context.value)}
      />
    </Frame>
  );
}

function OptionsField({ context }: Readonly<{ context: FormFieldRenderContext }>) {
  const options =
    context.field.kind === "async-select" ? COUNTRIES : (context.field.options ?? []);
  const selected = Array.isArray(context.value) ? context.value : [];
  return (
    <Frame context={context}>
      <View style={styles.choices}>
        {options.map((option) => {
          const active =
            context.field.kind === "multi-select"
              ? selected.includes(option.value)
              : context.value === option.value;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={option.value}
              onPress={() =>
                context.setValue(
                  context.field.kind === "multi-select"
                    ? toggle(selected, option.value)
                    : option.value,
                )
              }
              style={active ? styles.activeChoice : styles.choice}
            >
              <Text style={active ? styles.activeChoiceText : styles.choiceText}>
                {option.labelKey}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Frame>
  );
}

function ObjectField({ context }: Readonly<{ context: FormFieldRenderContext }>) {
  const value = asRecord(context.value);
  const fields =
    context.field.kind === "phone"
      ? [
          { key: "code", label: "Indicatif" },
          { key: "number", label: "Numéro" },
        ]
      : [
          { key: "start", label: "Début AAAA-MM-JJ" },
          { key: "end", label: "Fin AAAA-MM-JJ" },
          { key: "timezone", label: "Fuseau horaire" },
        ];
  return (
    <Frame context={context}>
      {fields.map((item) => (
        <TextInput
          accessibilityLabel={item.label}
          key={item.key}
          onChangeText={(text) => context.setValue({ ...value, [item.key]: text })}
          placeholder={item.label}
          style={styles.input}
          value={readString(value[item.key])}
        />
      ))}
    </Frame>
  );
}

function RepeaterField({ context }: Readonly<{ context: FormFieldRenderContext }>) {
  const rows = Array.isArray(context.value) ? context.value.map(asRecord) : [];
  return (
    <Frame context={context}>
      {rows.map((row, index) => (
        <View key={readString(row.rowId)} style={styles.row}>
          <Text style={styles.label}>Membre {index + 1}</Text>
          {(context.field.fields ?? []).map((nested) => (
            <TextInput
              accessibilityLabel={nested.labelKey}
              key={nested.id}
              onChangeText={(text) =>
                context.setValue(
                  replaceRow(rows, index, { ...row, [nested.name]: text }),
                )
              }
              placeholder={nested.labelKey}
              style={styles.input}
              value={readString(row[nested.name])}
            />
          ))}
          <Action
            label="Retirer"
            onPress={() =>
              context.setValue(rows.filter((_, rowIndex) => rowIndex !== index))
            }
            secondary
          />
        </View>
      ))}
      <Action
        disabled={rows.length >= (context.field.maxItems ?? 10)}
        label="Ajouter un membre"
        onPress={() =>
          context.setValue([
            ...rows,
            { email: "", name: "", rowId: crypto.randomUUID() },
          ])
        }
        secondary
      />
    </Frame>
  );
}

function FileField({ context }: Readonly<{ context: FormFieldRenderContext }>) {
  const files = Array.isArray(context.value) ? context.value : [];
  const pick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      type: context.field.accept ? [...context.field.accept] : "*/*",
    });
    if (!result.canceled)
      context.setValue(
        [
          ...files,
          ...result.assets
            .filter(
              (asset) =>
                (asset.size ?? 0) <=
                (context.field.maxBytes ?? Number.MAX_SAFE_INTEGER),
            )
            .map((asset) => ({
              fileId: crypto.randomUUID(),
              name: asset.name,
              size: asset.size ?? 0,
              type: asset.mimeType ?? "application/octet-stream",
            })),
        ].slice(0, context.field.maxItems ?? 1),
      );
  };
  return (
    <Frame context={context}>
      <Action label="Choisir des documents" onPress={() => void pick()} secondary />
      {files.map((file) => (
        <Text key={readString(asRecord(file).fileId)} style={styles.copy}>
          {readString(asRecord(file).name)}
        </Text>
      ))}
    </Frame>
  );
}

function Review({ context }: Readonly<{ context: FormRenderContext }>) {
  return (
    <View style={styles.review}>
      {Object.entries(context.values).map(([name, value]) => (
        <View key={name}>
          <Text style={styles.label}>{name}</Text>
          <Text style={styles.copy}>
            {typeof value === "string" ? value : JSON.stringify(value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Action({
  disabled = false,
  label,
  onPress,
  secondary = false,
}: Readonly<{
  disabled?: boolean;
  label: string;
  onPress: () => void;
  secondary?: boolean;
}>) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={secondary ? styles.secondaryButton : styles.button}
    >
      <Text style={secondary ? styles.secondaryButtonText : styles.buttonText}>
        {label}
      </Text>
    </Pressable>
  );
}

async function submit(
  featureId: string,
  operationId: string,
  values: JsonValue,
): Promise<void> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";
  const response = await fetch(`${apiUrl}/api/features/${featureId}/${operationId}`, {
    body: JSON.stringify(values),
    headers: {
      "content-type": "application/json",
      "x-idempotency-key": crypto.randomUUID(),
    },
    method: "POST",
  });
  if (!response.ok) throw new Error("La sauvegarde a échoué.");
}

function asRecord(value: JsonValue | undefined): Record<string, JsonValue> {
  return value && !Array.isArray(value) && typeof value === "object"
    ? { ...(value as Readonly<Record<string, JsonValue>>) }
    : {};
}
function readString(value: JsonValue | undefined): string {
  return typeof value === "string" ? value : "";
}
function toggle(values: readonly JsonValue[], value: string): readonly JsonValue[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}
function replaceRow(
  rows: readonly Record<string, JsonValue>[],
  index: number,
  row: Record<string, JsonValue>,
): readonly JsonValue[] {
  return rows.map((current, rowIndex) => (rowIndex === index ? row : current));
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: designTokens.spacing.md,
  },
  activeChoice: {
    backgroundColor: designTokens.color.ink,
    borderRadius: designTokens.radius.pill,
    minHeight: 44,
    padding: designTokens.spacing.sm,
  },
  activeChoiceText: { color: designTokens.color.accentContrast, fontWeight: "700" },
  button: {
    backgroundColor: designTokens.color.ink,
    borderRadius: designTokens.radius.pill,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: designTokens.spacing.md,
  },
  buttonText: { color: designTokens.color.accentContrast, fontWeight: "700" },
  choice: {
    borderColor: designTokens.color.border,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    minHeight: 44,
    padding: designTokens.spacing.sm,
  },
  choiceText: { color: designTokens.color.ink },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: designTokens.spacing.xs },
  copy: { color: designTokens.color.body, marginTop: designTokens.spacing.xs },
  error: { color: designTokens.color.danger, marginTop: designTokens.spacing.xs },
  field: { gap: designTokens.spacing.xs, marginTop: designTokens.spacing.md },
  form: {
    backgroundColor: designTokens.color.surface,
    borderColor: designTokens.color.border,
    borderRadius: designTokens.radius.card,
    borderWidth: 1,
    marginTop: designTokens.spacing.lg,
    padding: designTokens.spacing.md,
  },
  heading: {
    color: designTokens.color.ink,
    fontSize: 24,
    fontWeight: "800",
    marginTop: designTokens.spacing.xs,
  },
  input: {
    borderColor: designTokens.color.border,
    borderRadius: designTokens.radius.control,
    borderWidth: 1,
    color: designTokens.color.ink,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: designTokens.spacing.sm,
  },
  label: { color: designTokens.color.ink, fontWeight: "700" },
  progress: { color: designTokens.color.accent, fontSize: 12, fontWeight: "800" },
  review: { gap: designTokens.spacing.sm, marginTop: designTokens.spacing.md },
  row: {
    borderColor: designTokens.color.border,
    borderWidth: 1,
    gap: designTokens.spacing.xs,
    padding: designTokens.spacing.sm,
  },
  secondaryButton: {
    borderColor: designTokens.color.border,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: designTokens.spacing.sm,
  },
  secondaryButtonText: { color: designTokens.color.ink, fontWeight: "700" },
  success: {
    color: designTokens.color.accent,
    fontWeight: "700",
    marginTop: designTokens.spacing.md,
  },
});
