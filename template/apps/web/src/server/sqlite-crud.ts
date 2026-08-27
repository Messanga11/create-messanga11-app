import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  createSqliteCrudAdapter,
  createSqliteFeatureResourceAdapter,
} from "@messanga11/adapter-sqlite";
import { compileFeatureCatalog } from "@messanga11/core/features";
import { APP_FEATURE_CATALOG } from "@starter/features/catalog";
import Database from "better-sqlite3";

const DATABASE_PATH = join(process.cwd(), ".data", "demo.sqlite");

mkdirSync(dirname(DATABASE_PATH), { recursive: true });

const database = new Database(DATABASE_PATH);
database.pragma("journal_mode = WAL");
database.exec(`
  CREATE TABLE IF NOT EXISTS form_submissions (
    id TEXT PRIMARY KEY,
    idempotencyKey TEXT NOT NULL UNIQUE,
    formId TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
  ;
  CREATE TABLE IF NOT EXISTS feature_audit (
    id TEXT PRIMARY KEY,
    actorId TEXT,
    event TEXT NOT NULL,
    operation TEXT NOT NULL,
    outcome TEXT NOT NULL,
    requestId TEXT NOT NULL,
    tenantId TEXT,
    createdAt TEXT NOT NULL
  )
  ;
  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    idempotencyKey TEXT NOT NULL UNIQUE,
    invoiceNumber TEXT NOT NULL UNIQUE,
    payload TEXT NOT NULL,
    total REAL NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

const insertAudit = database.prepare(`
  INSERT INTO feature_audit (id, actorId, event, operation, outcome, requestId, tenantId, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

export function writeFeatureAudit(event: {
  readonly actorId?: string;
  readonly event: string;
  readonly operation: string;
  readonly outcome: string;
  readonly requestId: string;
  readonly tenantId?: string;
}): void {
  insertAudit.run(
    crypto.randomUUID(),
    event.actorId ?? null,
    event.event,
    event.operation,
    event.outcome,
    event.requestId,
    event.tenantId ?? null,
    new Date().toISOString(),
  );
}

export const sqliteCrud = createSqliteCrudAdapter({
  database,
  resources: {
    form_submissions: {
      columns: ["id", "idempotencyKey", "formId", "payload", "status", "createdAt"],
      jsonColumns: ["payload"],
      table: "form_submissions",
    },
    invoices: {
      columns: [
        "id",
        "idempotencyKey",
        "invoiceNumber",
        "payload",
        "total",
        "createdAt",
      ],
      jsonColumns: ["payload"],
      table: "invoices",
    },
  },
});

const COMPILED_CATALOG = compileFeatureCatalog(APP_FEATURE_CATALOG);

// SOT[feature-resource-storage]: SQLite derives its complete allowlist and development seed from the catalog.
export const sqliteFeatureResources = createSqliteFeatureResourceAdapter({
  database,
  resources: Object.fromEntries(
    Object.entries(COMPILED_CATALOG.resources).map(([key, resource]) => [
      key,
      {
        fields: Object.keys(resource.fields),
        ...(resource.seed ? { seed: resource.seed } : {}),
      },
    ]),
  ),
});
