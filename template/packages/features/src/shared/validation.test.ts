import assert from "node:assert/strict";
import { test } from "node:test";
import { getDisplayNameError, getEmailError, getPasswordError } from "./validation";

test("accepts bounded feature inputs", () => {
  assert.equal(getEmailError("demo@example.com"), undefined);
  assert.equal(getPasswordError("correct-password"), undefined);
  assert.equal(getDisplayNameError("Messanga Demo"), undefined);
});

test("rejects malformed or unbounded feature inputs", () => {
  assert.match(getEmailError("invalid") ?? "", /e-mail/);
  assert.match(getEmailError(`${"a".repeat(250)}@x.io`) ?? "", /e-mail/);
  assert.match(getPasswordError("short") ?? "", /8/);
  assert.match(getPasswordError("a".repeat(129)) ?? "", /128/);
  assert.match(getDisplayNameError(" ") ?? "", /2/);
  assert.match(getDisplayNameError("a".repeat(81)) ?? "", /80/);
});
