import assert from "node:assert/strict";
import { test } from "node:test";
import { isJsonValue } from "./index";

test("accepts serializable feature operation responses", () => {
  assert.equal(isJsonValue({ id: "invoice-1", lines: [1, true, null] }), true);
});

test("rejects non-JSON numbers and runtime values", () => {
  assert.equal(isJsonValue({ total: Number.NaN }), false);
  assert.equal(isJsonValue({ total: Number.POSITIVE_INFINITY }), false);
  assert.equal(isJsonValue({ execute: () => undefined }), false);
});
