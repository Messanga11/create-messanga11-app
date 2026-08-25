export interface InvoiceAmountsInput {
  readonly quantity: number;
  readonly taxRate: number;
  readonly unitPrice: number;
}

export interface InvoiceAmounts {
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
}

export function calculateInvoiceAmounts(
  input: InvoiceAmountsInput,
): InvoiceAmounts | undefined {
  if (!isBoundedNumber(input.quantity, 0.01, 10_000)) return undefined;
  if (!isBoundedNumber(input.unitPrice, 0, 1_000_000_000)) return undefined;
  if (!isBoundedNumber(input.taxRate, 0, 100)) return undefined;
  const subtotal = roundCurrency(input.quantity * input.unitPrice);
  const tax = roundCurrency(subtotal * (input.taxRate / 100));
  return { subtotal, tax, total: roundCurrency(subtotal + tax) };
}

function isBoundedNumber(value: number, minimum: number, maximum: number): boolean {
  return Number.isFinite(value) && value >= minimum && value <= maximum;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
