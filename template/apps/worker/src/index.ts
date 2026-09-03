import { createHmac } from "node:crypto";
import {
  type ClaimedOutboxMessage,
  createPostgresAdapter,
  processOutboxBatch,
} from "@messanga11/adapter-postgres";
import type { TenantId } from "@messanga11/tenancy";
import { z } from "zod";

const ConfigSchema = z.object({
  DATABASE_URL: z.string().min(1),
  EVENT_SINK_URL: z.url().refine((value) => new URL(value).protocol === "https:"),
  WEBHOOK_SIGNING_SECRET: z.string().min(32).max(256),
  WORKER_TENANT_IDS: z.string().min(1),
});

const config = ConfigSchema.parse(process.env);
const adapter = createPostgresAdapter({ connectionString: config.DATABASE_URL });
const tenants = Object.freeze(
  config.WORKER_TENANT_IDS.split(",").map((value) => value.trim() as TenantId),
);
const workerId = crypto.randomUUID();
let stopping = false;

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    stopping = true;
  });
}

while (!stopping) {
  await processOutboxBatch({
    outbox: adapter.outbox,
    publish,
    tenants,
    workerId,
  });
  await delay(1_000);
}

await adapter.close();

async function publish(message: ClaimedOutboxMessage): Promise<void> {
  const timestamp = String(Math.floor(Date.now() / 1_000));
  const body = JSON.stringify(message);
  const signature = createHmac("sha256", config.WEBHOOK_SIGNING_SECRET)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  const response = await fetch(config.EVENT_SINK_URL, {
    body,
    headers: {
      "content-type": "application/json",
      "x-messanga11-event-id": message.eventId,
      "x-messanga11-signature": `sha256=${signature}`,
      "x-messanga11-timestamp": timestamp,
    },
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Event delivery failed.");
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
