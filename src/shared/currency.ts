export function formatCurrency(value?: number | string | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}
