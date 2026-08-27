import assert from "node:assert/strict";
import { test } from "node:test";
import { createFeatureRequestHandler, handleFeatureRequest } from "./feature-backend";

const VALID_INPUT = {
  availability: {
    end: "2026-09-10",
    start: "2026-09-01",
    timezone: "Africa/Douala",
  },
  companyType: "business",
  country: "CM",
  documents: [],
  email: "team@example.com",
  members: [{ email: "member@example.com", name: "Member", rowId: "member-1" }],
  otp: "123456",
  phone: { code: "+237", number: "690000000" },
  roles: ["admin"],
};

const VALID_INVOICE = {
  clientName: "Restaurant Le Mfoundi",
  currency: "XAF",
  description: "Conception de l’expérience de commande",
  quantity: 2,
  taxRate: 19.25,
  unitPrice: 100_000,
};

test("executes only a declared feature operation and replays idempotently", async () => {
  const idempotencyKey = crypto.randomUUID();
  const first = await submit("form-builder", "submit", VALID_INPUT, idempotencyKey);
  const replay = await submit("form-builder", "submit", VALID_INPUT, idempotencyKey);
  assert.equal(first.status, 200);
  assert.equal(replay.status, 200);
  assert.deepEqual(await first.json(), await replay.json());
});

test("rejects undeclared operations and invalid inputs", async () => {
  const missing = await submit(
    "form-builder",
    "drop-database",
    {},
    crypto.randomUUID(),
  );
  const invalid = await submit(
    "form-builder",
    "submit",
    { admin: true },
    crypto.randomUUID(),
  );
  assert.equal(missing.status, 404);
  assert.equal(invalid.status, 400);
  assert.deepEqual(Object.keys(await invalid.json()).sort(), ["code", "requestId"]);
});

test("creates an invoice with authoritative totals and idempotent replay", async () => {
  const idempotencyKey = crypto.randomUUID();
  const first = await submit("invoice", "create", VALID_INVOICE, idempotencyKey);
  const replay = await submit(
    "invoice",
    "create",
    { ...VALID_INVOICE, unitPrice: 1 },
    idempotencyKey,
  );
  assert.equal(first.status, 200);
  assert.equal(replay.status, 200);
  const invoice = await first.json();
  assert.equal(invoice.total, 238_500);
  assert.match(invoice.invoiceNumber, /^FAC-\d{8}-[A-F0-9]{8}$/);
  assert.deepEqual(invoice, await replay.json());
});

test("rejects malformed invoice amounts before persistence", async () => {
  const response = await submit(
    "invoice",
    "create",
    { ...VALID_INVOICE, taxRate: 101 },
    crypto.randomUUID(),
  );
  assert.equal(response.status, 400);
  assert.deepEqual(Object.keys(await response.json()).sort(), ["code", "requestId"]);
});

test("executes generated resource CRUD through the declared catalog", async () => {
  const listed = await submit(
    "products",
    "list",
    { limit: 20, offset: 0 },
    crypto.randomUUID(),
  );
  assert.equal(listed.status, 200);
  const initial = await listed.json();
  assert.ok(initial.total >= 4);

  const created = await requestOperation(
    "products",
    "create",
    "POST",
    {
      values: {
        category: "Desserts",
        description: "Vanilla and caramel",
        name: "Crème brûlée",
        price: "$8.00",
        status: "Draft",
      },
    },
    crypto.randomUUID(),
  );
  assert.equal(created.status, 200);
  const product = await created.json();
  assert.equal(product.name, "Crème brûlée");

  const updated = await requestOperation(
    "products",
    "update",
    "PATCH",
    { id: product.id, values: { price: "$9.00" } },
    crypto.randomUUID(),
  );
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).price, "$9.00");

  const deleted = await requestOperation(
    "products",
    "delete",
    "DELETE",
    { id: product.id },
    crypto.randomUUID(),
  );
  assert.equal(deleted.status, 200);
});

test("rejects resource, field and method spoofing", async () => {
  const field = await submit(
    "products",
    "list",
    {
      filters: [{ field: "password", operator: "eq", value: "secret" }],
      limit: 10,
      offset: 0,
    },
    crypto.randomUUID(),
  );
  const method = await requestOperation(
    "products",
    "delete",
    "POST",
    { id: "turkey-burger" },
    crypto.randomUUID(),
  );
  assert.equal(field.status, 400);
  assert.equal(method.status, 405);
  assert.deepEqual(Object.keys(await field.json()).sort(), ["code", "requestId"]);
});

test("supports production backend plugins without allowing built-in overrides", async () => {
  assert.throws(
    () =>
      createFeatureRequestHandler({
        handlers: { "crud.list": async () => ({ records: [], total: 0 }) },
      }),
    /handler already registered/,
  );
  const denyAll = createFeatureRequestHandler({
    identity: () => ({ actorId: "actor", permissions: new Set() }),
  });
  const response = await denyAll(
    new Request("http://localhost/api/features/products/list", {
      body: JSON.stringify({ limit: 10, offset: 0 }),
      headers: { "content-type": "application/json" },
      method: "POST",
    }),
    { featureId: "products", operationId: "list" },
  );
  assert.equal(response.status, 403);
});

function submit(featureId: string, operationId: string, input: unknown, key: string) {
  return requestOperation(featureId, operationId, "POST", input, key);
}

function requestOperation(
  featureId: string,
  operationId: string,
  method: "DELETE" | "PATCH" | "POST",
  input: unknown,
  key: string,
) {
  const request = new Request(
    `http://localhost/api/features/${featureId}/${operationId}`,
    {
      body: JSON.stringify(input),
      headers: { "content-type": "application/json", "x-idempotency-key": key },
      method,
    },
  );
  return handleFeatureRequest(request, { featureId, operationId });
}
