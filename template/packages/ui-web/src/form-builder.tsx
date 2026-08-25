"use client";

import { createRefineDataProvider } from "@messanga11/adapter-refine";
import type { JsonValue } from "@messanga11/core";
import type { FormValues } from "@messanga11/core/forms";
import {
  type FormBuilderProps,
  type FormFieldRenderContext,
  type FormRenderContext,
  type FormRenderer,
  FormBuilder as HeadlessFormBuilder,
} from "@messanga11/formbuilder";
import type { FormBuilderPrimitiveProps } from "@starter/ui-engine";
import { useMemo } from "react";
import { createCrudHttpPort } from "./crud-http-port";

const COUNTRIES = [
  { labelKey: "Cameroun", value: "CM" },
  { labelKey: "France", value: "FR" },
  { labelKey: "Sénégal", value: "SN" },
] as const;

const OTP_CELLS = ["otp-1", "otp-2", "otp-3", "otp-4", "otp-5", "otp-6"] as const;

export function WebFormBuilder(props: FormBuilderPrimitiveProps) {
  const provider = useMemo(
    () => createRefineDataProvider(createCrudHttpPort("/api/features")),
    [],
  );
  const submit: FormBuilderProps["onSubmit"] = async (values) => {
    await provider.create({
      resource: `${props.featureId}.${props.operationId}`,
      variables: values,
    });
  };
  return (
    <HeadlessFormBuilder
      defaultValues={props.defaultValues}
      definition={props.definition}
      onSubmit={submit}
      renderer={WEB_FORM_RENDERER}
    />
  );
}

const WEB_FORM_RENDERER: FormRenderer = {
  field: renderField,
  focus: (fieldName) => document.getElementById(`field-${fieldName}`)?.focus(),
  form: renderForm,
};

function renderForm(context: FormRenderContext) {
  const step = context.definition.steps[context.stepIndex];
  if (!step) return null;
  return (
    <form
      className="complex-form"
      onSubmit={(event) => {
        event.preventDefault();
        context.submit();
      }}
    >
      <header className="form-header">
        <p className="form-progress">
          Étape {context.stepIndex + 1} sur {context.definition.steps.length}
        </p>
        <h2>{step.titleKey}</h2>
        {step.descriptionKey ? <p>{step.descriptionKey}</p> : null}
      </header>
      {step.id === "review" ? (
        <Review values={context.values} />
      ) : (
        <section className="form-grid">
          {step.fields.map((field) => (
            <span className="form-field-slot" key={field.id}>
              {context.renderField(field)}
            </span>
          ))}
        </section>
      )}
      {context.issues.length > 0 ? (
        <p aria-live="assertive" className="form-error">
          Corrigez les champs signalés avant de continuer.
        </p>
      ) : null}
      <footer className="form-actions">
        {context.canGoBack ? (
          <button className="secondary-button" onClick={context.goBack} type="button">
            Retour
          </button>
        ) : (
          <span />
        )}
        {context.canGoNext ? (
          <button className="action-button" onClick={context.goNext} type="button">
            Continuer
          </button>
        ) : (
          <button
            className="action-button"
            disabled={context.status === "submitting"}
            type="submit"
          >
            {context.status === "submitting"
              ? "Enregistrement…"
              : context.definition.submitLabelKey}
          </button>
        )}
      </footer>
      {context.status === "succeeded" ? (
        <p aria-live="polite" className="form-success">
          Configuration enregistrée dans SQLite.
        </p>
      ) : null}
    </form>
  );
}

function renderField(context: FormFieldRenderContext) {
  const { field } = context;
  if (field.kind === "boolean") return <BooleanField {...context} />;
  if (
    field.kind === "select" ||
    field.kind === "multi-select" ||
    field.kind === "async-select"
  )
    return <OptionsField {...context} />;
  if (field.kind === "phone") return <PhoneField {...context} />;
  if (field.kind === "otp") return <OtpField {...context} />;
  if (field.kind === "date-range") return <DateRangeField {...context} />;
  if (field.kind === "repeater") return <RepeaterField {...context} />;
  if (field.kind === "file") return <FileField {...context} />;
  return <TextField {...context} />;
}

function FieldFrame(
  props: Readonly<{ children: React.ReactNode; context: FormFieldRenderContext }>,
) {
  return (
    <fieldset className="complex-field">
      <legend>{props.context.field.labelKey}</legend>
      {props.children}
      {props.context.issues.map((issue) => (
        <p className="field-error" key={`${issue.code}-${issue.path.join(".")}`}>
          {issue.messageKey}
        </p>
      ))}
    </fieldset>
  );
}

function TextField(context: FormFieldRenderContext) {
  const type =
    context.field.kind === "password"
      ? "password"
      : context.field.kind === "number"
        ? "number"
        : context.field.kind === "email"
          ? "email"
          : "text";
  return (
    <FieldFrame context={context}>
      <input
        id={`field-${context.field.name}`}
        onChange={(event) =>
          context.setValue(
            type === "number"
              ? Number(event.currentTarget.value)
              : event.currentTarget.value,
          )
        }
        type={type}
        value={
          typeof context.value === "string" || typeof context.value === "number"
            ? context.value
            : ""
        }
      />
    </FieldFrame>
  );
}

function BooleanField(context: FormFieldRenderContext) {
  return (
    <FieldFrame context={context}>
      <button
        aria-pressed={context.value === true}
        className="choice-button"
        id={`field-${context.field.name}`}
        onClick={() => context.setValue(context.value !== true)}
        type="button"
      >
        {context.value === true ? "Oui" : "Non"}
      </button>
    </FieldFrame>
  );
}

function OptionsField(context: FormFieldRenderContext) {
  const options =
    context.field.kind === "async-select" ? COUNTRIES : (context.field.options ?? []);
  const selected = Array.isArray(context.value) ? context.value : [];
  return (
    <FieldFrame context={context}>
      <div className="choice-list" id={`field-${context.field.name}`}>
        {options.map((option) => {
          const active =
            context.field.kind === "multi-select"
              ? selected.includes(option.value)
              : context.value === option.value;
          return (
            <button
              aria-pressed={active}
              className={
                active ? "choice-button choice-button-active" : "choice-button"
              }
              key={option.value}
              onClick={() =>
                context.setValue(
                  context.field.kind === "multi-select"
                    ? toggle(selected, option.value)
                    : option.value,
                )
              }
              type="button"
            >
              {option.labelKey}
            </button>
          );
        })}
      </div>
    </FieldFrame>
  );
}

function PhoneField(context: FormFieldRenderContext) {
  const value = asRecord(context.value);
  return (
    <FieldFrame context={context}>
      <div className="phone-grid">
        <input
          aria-label="Indicatif"
          id={`field-${context.field.name}`}
          onChange={(event) =>
            context.setValue({ ...value, code: event.currentTarget.value })
          }
          placeholder="+237"
          value={readString(value.code)}
        />
        <input
          aria-label="Numéro"
          inputMode="tel"
          onChange={(event) =>
            context.setValue({ ...value, number: event.currentTarget.value })
          }
          value={readString(value.number)}
        />
      </div>
    </FieldFrame>
  );
}

function OtpField(context: FormFieldRenderContext) {
  const value = readString(context.value).slice(0, 6).padEnd(6, " ");
  return (
    <FieldFrame context={context}>
      <div className="otp-grid" id={`field-${context.field.name}`}>
        {OTP_CELLS.map((cellId, index) => (
          <input
            aria-label={`Chiffre ${index + 1}`}
            inputMode="numeric"
            key={cellId}
            maxLength={1}
            onChange={(event) =>
              context.setValue(
                `${value.slice(0, index)}${event.currentTarget.value.replace(/\D/g, "")}${value.slice(index + 1)}`.trim(),
              )
            }
            value={value[index]?.trim() ?? ""}
          />
        ))}
      </div>
    </FieldFrame>
  );
}

function DateRangeField(context: FormFieldRenderContext) {
  const value = asRecord(context.value);
  return (
    <FieldFrame context={context}>
      <div className="date-grid">
        <input
          aria-label="Date de début"
          id={`field-${context.field.name}`}
          onChange={(event) =>
            context.setValue({ ...value, start: event.currentTarget.value })
          }
          placeholder="AAAA-MM-JJ"
          value={readString(value.start)}
        />
        <input
          aria-label="Date de fin"
          onChange={(event) =>
            context.setValue({ ...value, end: event.currentTarget.value })
          }
          placeholder="AAAA-MM-JJ"
          value={readString(value.end)}
        />
        <input
          aria-label="Fuseau horaire"
          onChange={(event) =>
            context.setValue({ ...value, timezone: event.currentTarget.value })
          }
          value={readString(value.timezone)}
        />
      </div>
    </FieldFrame>
  );
}

function RepeaterField(context: FormFieldRenderContext) {
  const rows = Array.isArray(context.value) ? context.value.map(asRecord) : [];
  return (
    <FieldFrame context={context}>
      <div className="repeater" id={`field-${context.field.name}`}>
        {rows.map((row, index) => (
          <section className="repeater-row" key={readString(row.rowId)}>
            <strong>Membre {index + 1}</strong>
            {(context.field.fields ?? []).map((nested) => (
              <input
                aria-label={nested.labelKey}
                key={nested.id}
                onChange={(event) =>
                  context.setValue(
                    replaceRow(rows, index, {
                      ...row,
                      [nested.name]: event.currentTarget.value,
                    }),
                  )
                }
                placeholder={nested.labelKey}
                value={readString(row[nested.name])}
              />
            ))}
            <button
              className="text-button"
              onClick={() =>
                context.setValue(rows.filter((_, rowIndex) => rowIndex !== index))
              }
              type="button"
            >
              Retirer
            </button>
          </section>
        ))}
        <button
          className="secondary-button"
          disabled={rows.length >= (context.field.maxItems ?? 10)}
          onClick={() =>
            context.setValue([
              ...rows,
              { email: "", name: "", rowId: crypto.randomUUID() },
            ])
          }
          type="button"
        >
          Ajouter un membre
        </button>
      </div>
    </FieldFrame>
  );
}

function FileField(context: FormFieldRenderContext) {
  const files = Array.isArray(context.value) ? context.value.map(asRecord) : [];
  return (
    <FieldFrame context={context}>
      <div id={`field-${context.field.name}`}>
        <input
          accept={context.field.accept?.join(",")}
          multiple
          onChange={(event) =>
            context.setValue([
              ...files,
              ...Array.from(event.currentTarget.files ?? [])
                .filter(
                  (file) =>
                    file.size <= (context.field.maxBytes ?? Number.MAX_SAFE_INTEGER) &&
                    (context.field.accept?.includes(file.type) ?? true),
                )
                .slice(0, (context.field.maxItems ?? 1) - files.length)
                .map((file) => ({
                  fileId: crypto.randomUUID(),
                  name: file.name,
                  size: file.size,
                  type: file.type,
                })),
            ])
          }
          type="file"
        />
        <ul className="file-list">
          {files.map((file, index) => (
            <li key={readString(file.fileId)}>
              <span>{readString(file.name)}</span>
              <button
                className="text-button"
                onClick={() => context.setValue(move(files, index, -1))}
                type="button"
              >
                Monter
              </button>
              <button
                className="text-button"
                onClick={() => context.setValue(move(files, index, 1))}
                type="button"
              >
                Descendre
              </button>
            </li>
          ))}
        </ul>
      </div>
    </FieldFrame>
  );
}

function Review({ values }: Readonly<{ values: FormValues }>) {
  return (
    <section className="review-panel">
      <h3>Données à enregistrer</h3>
      <dl>
        {Object.entries(values).map(([name, value]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{typeof value === "string" ? value : JSON.stringify(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
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

function move(
  items: readonly Record<string, JsonValue>[],
  index: number,
  direction: -1 | 1,
): readonly JsonValue[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target] ?? {}, next[index] ?? {}];
  return next;
}
