import type { DraftLine } from '../lib/txnCalc'
import { linePreview } from '../lib/txnCalc'
import { won } from '../lib/format'

type Props = {
  kind: 'sales' | 'purchase'
  lines: DraftLine[]
  taxMap: Record<string, string>
  onChange: (lines: DraftLine[]) => void
}

export default function LineGrid({ kind, lines, taxMap, onChange }: Props) {
  const update = (idx: number, patch: Partial<DraftLine>) => {
    const next = lines.map((l, i) => (i === idx ? { ...l, ...patch } : l))
    onChange(next)
  }

  const addRow = () => onChange([...lines, { product_name: '', spec: '', unit_price: 0, qty: '' }])

  const addDeposit = () =>
    onChange([...lines, { product_name: '입금', spec: '', unit_price: 0, qty: '' }])

  const remove = (idx: number) => onChange(lines.filter((_, i) => i !== idx))

  const paymentLabel = kind === 'sales' ? '입금' : '지급'

  return (
    <div className="line-grid">
      <div className="line-grid__head">
        <span>품목</span>
        <span>규격</span>
        <span>단가</span>
        <span>수량</span>
        <span>공급가</span>
        <span>세액</span>
        <span />
      </div>
      {lines.map((ln, idx) => {
        const p = linePreview(ln, taxMap)
        const isDep = ln.product_name.trim() === '입금'
        return (
          <div key={idx} className={`line-grid__row ${isDep ? 'line-grid__row--deposit' : ''}`}>
            <input
              value={ln.product_name}
              placeholder={isDep ? paymentLabel : '품목명'}
              list="product-list"
              onChange={(e) => update(idx, { product_name: e.target.value })}
            />
            <input
              value={ln.spec}
              placeholder="규격"
              disabled={isDep}
              onChange={(e) => update(idx, { spec: e.target.value })}
            />
            <input
              type="text"
              inputMode="numeric"
              value={isDep ? (ln.unit_price || '') : ln.unit_price || ''}
              placeholder="0"
              onChange={(e) =>
                update(idx, { unit_price: Number(e.target.value.replace(/,/g, '')) || 0 })
              }
            />
            <input
              value={ln.qty}
              placeholder="0"
              disabled={isDep}
              onChange={(e) => update(idx, { qty: e.target.value })}
            />
            <span className="line-grid__num">{p.supply ? won(p.supply) : '—'}</span>
            <span className="line-grid__num">{p.tax ? won(p.tax) : '—'}</span>
            <button type="button" className="line-grid__del" onClick={() => remove(idx)} aria-label="삭제">
              ×
            </button>
          </div>
        )
      })}
      <div className="line-grid__actions">
        <button type="button" className="btn btn--ghost" onClick={addRow}>
          + 품목
        </button>
        <button type="button" className="btn btn--ghost" onClick={addDeposit}>
          + {paymentLabel}
        </button>
      </div>
    </div>
  )
}
