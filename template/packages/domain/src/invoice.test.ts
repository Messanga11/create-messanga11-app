import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateInvoiceAmounts } from "./invoice";

test("calculates rounded invoice amounts", () => {
  assert.deepEqual(
    calculateInvoiceAmounts({ quantity: 3, taxRate: 19.25, unitPrice: 12_500 }),
    { subtotal: 37_500, tax: 7_218.75, total: 44_718.75 },
  );
});

test("rejects non-finite and out-of-range monetary inputs", () => {
  assert.equal(
    calculateInvoiceAmounts({ quantity: 0, taxRate: 20, unitPrice: 10 }),
    undefined,
  );
  assert.equal(
    calculateInvoiceAmounts({
      quantity: 1,
      taxRate: Number.NaN,
      unitPrice: 10,
    }),
    undefined,
  );
  assert.equal(
    calculateInvoiceAmounts({
      quantity: 1,
      taxRate: 20,
      unitPrice: 1_000_000_001,
    }),
    undefined,
  );
});
