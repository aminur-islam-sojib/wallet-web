export function bdtToPaisa(amount: string) {
  const normalized = amount.trim();
  const [takaPart, paisaPart = ""] = normalized.split(".");
  const taka = Number.parseInt(takaPart, 10);
  const paisa = Number.parseInt(paisaPart.padEnd(2, "0").slice(0, 2), 10) || 0;

  return taka * 100 + paisa;
}

export function formatBDT(amountPaisa: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amountPaisa / 100);
}
