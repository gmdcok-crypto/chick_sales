export function won(n: number | string | null | undefined): string {
  const v = Number(n) || 0
  return `${v.toLocaleString('ko-KR')}원`
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function parseNum(s: string): number {
  return Number(String(s).replace(/,/g, '')) || 0
}

export function txnDate(row: { txn_date?: string; sales_date?: string; purchase_date?: string }): string {
  return String(row.txn_date || row.sales_date || row.purchase_date || '').slice(0, 10)
}
