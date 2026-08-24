import assert from "node:assert/strict";
import { test } from "node:test";
import { canPerform } from "@messanga11/core";
import { buildProfileUiMeta } from "./profile-policy";

test("profile actions deny by default", () => {
  const uiMeta = buildProfileUiMeta([]);

  assert.equal(canPerform(uiMeta, "view"), false);
  assert.equal(canPerform(uiMeta, "edit"), false);
});

test("profile policy grants only explicit permissions", () => {
  const uiMeta = buildProfileUiMeta(["profile:read"]);

  assert.equal(canPerform(uiMeta, "view"), true);
  assert.equal(canPerform(uiMeta, "edit"), false);
});
