import { z } from "zod";
import { sqliteCrud } from "../../../server/sqlite-crud";

const MAX_BODY_BYTES = 1_000_000;

const CreateRequestSchema = z
  .object({
    idempotencyKey: z.uuid(),
    resource: z.literal("form_submissions"),
    values: z
      .object({
        createdAt: z.iso.datetime(),
        formId: z.string().trim().min(1).max(100),
        payload: z.json(),
        status: z.literal("submitted"),
      })
      .strict(),
  })
  .strict();

export async function POST(request: Request): Promise<Response> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ code: "INVALID_INPUT" }, { status: 415 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ code: "INVALID_INPUT" }, { status: 413 });
  }
  const body = await request.json().catch(() => null);
  const parsed = CreateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ code: "INVALID_INPUT" }, { status: 400 });
  }
  const existing = await sqliteCrud.list({
    filters: [
      {
        field: "idempotencyKey",
        operator: "eq",
        value: parsed.data.idempotencyKey,
      },
    ],
    limit: 1,
    offset: 0,
    resource: parsed.data.resource,
  });
  if (existing.records[0]) {
    return Response.json(existing.records[0]);
  }
  try {
    const record = await sqliteCrud.create({
      ...parsed.data,
      values: {
        ...parsed.data.values,
        idempotencyKey: parsed.data.idempotencyKey,
      },
    });
    return Response.json(record, { status: 201 });
  } catch {
    return Response.json({ code: "INTERNAL" }, { status: 500 });
  }
}
