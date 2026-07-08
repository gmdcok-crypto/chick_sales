import { useEffect } from 'react'
import { useTxnForm } from '../hooks/useTxnForm'
import { useTabs } from '../context/TabContext'

type Kind = 'sales' | 'purchase'

export default function TxnFormPanel({ kind }: { kind: Kind }) {
  const { openTab } = useTabs()
  const form = useTxnForm({
    kind,
    onSaved: () => openTab(kind === 'sales' ? 'sales-list' : 'purchase-list'),
  })

  const payLabel = kind === 'sales' ? '입금' : '지급'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F2' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        form.save()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [form])

  return (
    <div className="erp-panel erp-panel--form erp-panel--txn-form">
      <div className="erp-txn-card">
        <div className="erp-toolbar">
          <span className="erp-toolbar__title">{kind === 'sales' ? '매출등록' : '매입등록'}</span>
          <div className="erp-toolbar__actions">
            <button type="button" className="erp-btn erp-btn--primary" disabled={form.saving} onClick={form.save}>
              저장(Ctrl+F2)
            </button>
            <button type="button" className="erp-btn" onClick={() => form.addLine()}>
              + 품목행
            </button>
            <button type="button" className="erp-btn" onClick={() => form.addDeposit()}>
              + {payLabel}
            </button>
            <button type="button" className="erp-btn" onClick={() => openTab('product-new')}>
              품목등록
            </button>
          </div>
        </div>

        <div className="erp-form-header">
          <label>
            <span>{kind === 'sales' ? '거래처' : '매입처'}</span>
            <input
              list="erp-company-list"
              value={form.companyQuery}
              onChange={(e) => {
                form.setCompanyQuery(e.target.value)
                form.pickCompany(e.target.value)
              }}
            />
          </label>
          <label>
            <span>{kind === 'sales' ? '매출일' : '매입일'}</span>
            <input type="date" value={form.txnDate} onChange={(e) => form.setTxnDate(e.target.value)} />
          </label>
          <label>
            <span>이력번호</span>
            <select value={form.traceNo} onChange={(e) => form.setTraceNo(e.target.value)}>
              <option value="">—</option>
              {form.traces.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          {!form.companyId && form.companyQuery.trim() && (
            <button type="button" className="erp-btn erp-btn--link" onClick={() => openTab('company-new')}>
              거래처 등록
            </button>
          )}
        </div>

        <datalist id="erp-company-list">
          {form.companies.map((c) => (
            <option key={c.id} value={c.company_name} />
          ))}
        </datalist>
        <datalist id="erp-product-list">
          {form.products.map((p) => (
            <option key={p.id} value={p.product_name} />
          ))}
        </datalist>

        <div className="dg-wrap dg-wrap--txn">
          <div className="dg-scroll">
            <table className="dg dg--edit">
              <thead>
                <tr>
                  <th className="dg__no">No</th>
                  <th style={{ width: 180 }}>품목명</th>
                  <th style={{ width: 90 }}>규격</th>
                  <th style={{ width: 90 }}>단가</th>
                  <th style={{ width: 70 }}>수량</th>
                  <th style={{ width: 100 }}>공급가액</th>
                  <th style={{ width: 80 }}>세액</th>
                  <th style={{ width: 32 }} />
                </tr>
              </thead>
              <tbody>
                {form.lines.map((ln, idx) => {
                  const p = form.linePreview(ln, form.taxMap)
                  const isDep = ln.product_name.trim() === '입금'
                  return (
                    <tr key={idx} className={isDep ? 'dg__row--deposit' : undefined}>
                      <td className="dg__no">{idx + 1}</td>
                      <td>
                        <input
                          className="dg-input"
                          value={ln.product_name}
                          list="erp-product-list"
                          onChange={(e) => form.updateLine(idx, { product_name: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="dg-input"
                          value={ln.spec}
                          disabled={isDep}
                          onChange={(e) => form.updateLine(idx, { spec: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="dg-input dg-input--num"
                          value={ln.unit_price || ''}
                          onChange={(e) =>
                            form.updateLine(idx, {
                              unit_price: Number(e.target.value.replace(/,/g, '')) || 0,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="dg-input dg-input--num"
                          value={ln.qty}
                          disabled={isDep}
                          onChange={(e) => form.updateLine(idx, { qty: e.target.value })}
                        />
                      </td>
                      <td className="dg__num">{p.supply ? form.won(p.supply) : ''}</td>
                      <td className="dg__num">{p.tax ? form.won(p.tax) : ''}</td>
                      <td>
                        <button
                          type="button"
                          className="dg__del"
                          onClick={() =>
                            form.setLines(form.lines.filter((_, i) => i !== idx))
                          }
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {form.error && <div className="erp-form-error">{form.error}</div>}

        <div className="erp-statusbar">
          <span>전잔액 <strong>{form.won(form.prevBalance)}</strong></span>
          <span>
            {kind === 'sales' ? '매출합계' : '매입합계'}{' '}
            <strong>{form.won(form.summary.total)}</strong>
          </span>
          <span>
            {payLabel} <strong>{form.won(form.summary.payment)}</strong>
          </span>
          <span className="erp-statusbar__balance">
            잔액 <strong>{form.won(form.summary.balance)}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
