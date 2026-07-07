/** 클라이언트 미리보기 — backend/logic.py 와 동일 규칙 */

export type DraftLine = {
  product_name: string
  spec: string
  unit_price: number
  qty: string
  tax_type?: string
}

function parseQty(qty: string): number {
  const s = (qty || '').replace(/,/g, '').trim()
  if (!s) return 0
  const n = Math.round(parseFloat(s) * 10) / 10
  return Number.isFinite(n) ? n : 0
}

function round10(x: number): number {
  return Math.round(x / 10) * 10
}

function gross(unit: number, qty: string): number {
  const q = parseQty(qty)
  if (q <= 0 || unit <= 0) return 0
  return Math.round(unit * q)
}

function splitTax(grossAmt: number, taxType: string): { supply: number; tax: number } {
  const tt = taxType || '면세'
  if (tt === '과세' && grossAmt > 0) {
    let supply = Math.round(grossAmt / 1.1)
    supply = round10(supply)
    return { supply, tax: grossAmt - supply }
  }
  return { supply: round10(grossAmt), tax: 0 }
}

export function linePreview(line: DraftLine, taxMap: Record<string, string>) {
  const name = (line.product_name || '').trim()
  if (name === '입금') {
    const amt = line.unit_price || 0
    return { supply: amt, tax: 0, total: amt, isDeposit: true }
  }
  if (!name) return { supply: 0, tax: 0, total: 0, isDeposit: false }
  const g = gross(line.unit_price, line.qty)
  const tt = line.tax_type || taxMap[name] || '면세'
  const { supply, tax } = splitTax(g, tt)
  return { supply, tax, total: supply + tax, isDeposit: false }
}

export function summarize(
  lines: DraftLine[],
  taxMap: Record<string, string>,
  prevBalance: number,
  extraPayment = 0,
) {
  let total = 0
  let payment = extraPayment
  for (const ln of lines) {
    const p = linePreview(ln, taxMap)
    if (p.isDeposit) payment += p.total
    else total += p.total
  }
  const balance = prevBalance + total - payment
  return { total, payment, balance }
}

export function emptyLine(): DraftLine {
  return { product_name: '', spec: '', unit_price: 0, qty: '' }
}
