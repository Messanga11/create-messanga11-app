"use client";

import type { JsonValue } from "@messanga11/core";
import type { FeatureBlockNode } from "@messanga11/core/features";
import {
  ResourceList,
  type ResourceListPrimitiveProps,
  type ResourceRow,
  type StatusTone,
  useFeatureOperation,
} from "@starter/ui-engine";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProductFeatureId } from "../feature-types";
import { FeatureShell } from "../shared/feature-shell";

interface ResourceFeatureProps {
  readonly node: FeatureBlockNode;
}

type ResourceView = Omit<ResourceListPrimitiveProps, "rows">;
type RecordValue = Readonly<Record<string, JsonValue>>;
type EditorState = {
  readonly id?: string;
  readonly values: Readonly<Record<string, string>>;
};

export function ResourceFeature({ node }: ResourceFeatureProps) {
  const view = node.props as unknown as ResourceView;
  const featureId = view.title.toLowerCase() as ProductFeatureId;
  const execute = useFeatureOperation();
  const [records, setRecords] = useState<readonly RecordValue[]>([]);
  const [state, setState] =
    useState<NonNullable<ResourceListPrimitiveProps["state"]>>("loading");
  const [editor, setEditor] = useState<EditorState | undefined>();

  const load = useCallback(async () => {
    setState("loading");
    try {
      const result = await execute({
        featureId,
        input: { limit: 50, offset: 0 },
        method: "POST",
        operationId: node.query ?? "",
      });
      setRecords(readListRecords(result));
      setState("ready");
    } catch {
      setState("error");
    }
  }, [execute, featureId, node.query]);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(
    () => records.map((record) => toResourceRow(record, view.columns)),
    [records, view.columns],
  );

  async function save(): Promise<void> {
    if (!editor) return;
    setState("submitting");
    try {
      await execute({
        featureId,
        input: editor.id
          ? { id: editor.id, values: editor.values }
          : { values: editor.values },
        method: editor.id ? "PATCH" : "POST",
        operationId: editor.id
          ? (node.actions?.update ?? "")
          : (node.actions?.create ?? ""),
      });
      setEditor(undefined);
      await load();
    } catch {
      setState("error");
    }
  }

  async function remove(id: string): Promise<void> {
    setState("submitting");
    try {
      await execute({
        featureId,
        input: { id },
        method: "DELETE",
        operationId: node.actions?.delete ?? "",
      });
      await load();
    } catch {
      setState("error");
    }
  }

  const editorProps = editor
    ? createEditorProps(editor, view, setEditor, save)
    : undefined;

  return (
    <FeatureShell
      active={featureId}
      description=""
      showIntro={false}
      title={view.title}
    >
      <ResourceList
        {...view}
        {...(editorProps ? { editor: editorProps } : {})}
        errorLabel="Unable to load this resource."
        onCreate={() => setEditor({ values: emptyValues(view.columns) })}
        onDelete={(id) => void remove(id)}
        onEdit={(id) => {
          const record = records.find((item) => item.id === id);
          if (record) setEditor({ id, values: editableValues(record, view.columns) });
        }}
        onRetry={() => void load()}
        rows={rows}
        state={state}
      />
    </FeatureShell>
  );
}

function createEditorProps(
  editor: EditorState,
  view: ResourceView,
  setEditor: (
    value:
      | EditorState
      | undefined
      | ((current: EditorState | undefined) => EditorState | undefined),
  ) => void,
  save: () => Promise<void>,
) {
  return {
    fields: view.columns.map((column) => ({
      id: column.id,
      label: column.label,
      onChange: (value: string) =>
        setEditor((current) =>
          current
            ? { ...current, values: { ...current.values, [column.id]: value } }
            : current,
        ),
      value: editor.values[column.id] ?? "",
    })),
    onCancel: () => setEditor(undefined),
    onSubmit: () => void save(),
    title: editor.id
      ? `Edit ${view.title}`
      : (view.primaryAction ?? `Add ${view.title}`),
  };
}

function readListRecords(value: JsonValue): readonly RecordValue[] {
  if (!isRecord(value) || !Array.isArray(value.records))
    throw new TypeError("Invalid list response");
  return value.records.filter(isRecord);
}

function toResourceRow(
  record: RecordValue,
  columns: ResourceView["columns"],
): ResourceRow {
  return {
    cells: Object.fromEntries(
      columns.map((column) => {
        const secondary = readString(record[`${column.id}Secondary`]);
        const tone = readTone(record[`${column.id}Tone`]);
        return [
          column.id,
          {
            ...(secondary ? { secondary } : {}),
            ...(tone ? { tone } : {}),
            value: displayValue(record[column.id]),
          },
        ];
      }),
    ),
    id: readString(record.id) ?? "invalid-record",
  };
}

function emptyValues(
  columns: ResourceView["columns"],
): Readonly<Record<string, string>> {
  return Object.fromEntries(columns.map((column) => [column.id, ""]));
}

function editableValues(
  record: RecordValue,
  columns: ResourceView["columns"],
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    columns.map((column) => [column.id, displayValue(record[column.id])]),
  );
}

function displayValue(value: JsonValue | undefined): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "—";
}

function readString(value: JsonValue | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readTone(value: JsonValue | undefined): StatusTone | undefined {
  return value === "danger" ||
    value === "info" ||
    value === "neutral" ||
    value === "success" ||
    value === "warning"
    ? value
    : undefined;
}

function isRecord(value: JsonValue): value is RecordValue {
  return Boolean(value) && !Array.isArray(value) && typeof value === "object";
}
