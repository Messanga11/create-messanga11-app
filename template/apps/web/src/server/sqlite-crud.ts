import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createSqliteCrudAdapter } from "@messanga11/adapter-sqlite";
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
`);

export const sqliteCrud = createSqliteCrudAdapter({
  database,
  resources: {
    form_submissions: {
      columns: ["id", "idempotencyKey", "formId", "payload", "status", "createdAt"],
      jsonColumns: ["payload"],
      table: "form_submissions",
    },
  },
});
