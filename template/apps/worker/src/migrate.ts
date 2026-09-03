import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import {
  runMigrations,
  type SqlMigration,
  type SqlPoolPort,
} from "@messanga11/adapter-postgres";
import { Pool } from "pg";
import { z } from "zod";

const ManifestSchema = z.array(
  z.object({
    file: z.string().regex(/^\d{3}_[a-z0-9_]+\.sql$/),
    name: z.string().min(1).max(128),
    version: z.number().int().positive(),
  }),
);
const databaseUrl = z.string().min(1).parse(process.env.DATABASE_MIGRATION_URL);
const require = createRequire(import.meta.url);
const manifestPath = require.resolve("@messanga11/adapter-postgres/migrations");
const directory = dirname(manifestPath);
const manifest = ManifestSchema.parse(
  JSON.parse(await readFile(manifestPath, "utf8")) as unknown,
);
const migrations: SqlMigration[] = [];

for (const entry of manifest) {
  migrations.push({
    name: entry.name,
    sql: await readFile(join(directory, entry.file), "utf8"),
    version: entry.version,
  });
}

const pool = new Pool({ connectionString: databaseUrl, max: 1 });
try {
  await runMigrations(pool as unknown as SqlPoolPort, migrations);
} finally {
  await pool.end();
}
