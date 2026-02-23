export function formatCurrency(amount: bigint): string {
  const dollars = Number(amount) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

export function parseCurrency(value: string): bigint {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const cents = Math.round(parseFloat(cleaned || '0') * 100);
  return BigInt(cents);
}

export function calculateLineItemTotal(quantity: bigint, unitPrice: bigint): bigint {
  return quantity * unitPrice;
}

export function calculateReceiptTotal(items: Array<{ total: bigint }>): bigint {
  return items.reduce((sum, item) => sum + item.total, BigInt(0));
}

export function calculatePaymentsTotal(payments: Array<{ amount: bigint }>): bigint {
  return payments.reduce((sum, payment) => sum + payment.amount, BigInt(0));
}

export function calculateBalance(total: bigint, payments: Array<{ amount: bigint }>): bigint {
  const paid = calculatePaymentsTotal(payments);
  return total > paid ? total - paid : BigInt(0);
}
