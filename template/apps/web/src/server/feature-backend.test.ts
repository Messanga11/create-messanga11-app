import assert from "node:assert/strict";
import { test } from "node:test";
import { handleFeatureRequest } from "./feature-backend";

const VALID_INPUT = {
  availability: { end: "2026-09-10", start: "2026-09-01", timezone: "Africa/Douala" },
  companyType: "business",
  country: "CM",
  documents: [],
  email: "team@example.com",
  members: [{ email: "member@example.com", name: "Member", rowId: "member-1" }],
  otp: "123456",
  phone: { code: "+237", number: "690000000" },
  roles: ["admin"],
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

function submit(featureId: string, operationId: string, input: unknown, key: string) {
  const request = new Request(
    `http://localhost/api/features/${featureId}/${operationId}`,
    {
      body: JSON.stringify(input),
      headers: { "content-type": "application/json", "x-idempotency-key": key },
      method: "POST",
    },
  );
  return handleFeatureRequest(request, { featureId, operationId });
}
