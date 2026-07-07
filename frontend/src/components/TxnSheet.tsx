import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, type Company, type Product } from '../lib/api'
import { todayISO, won } from '../lib/format'
import { emptyLine, summarize, type DraftLine } from '../lib/txnCalc'
import LineGrid from './LineGrid'

type Kind = 'sales' | 'purchase'

type Props = {
  kind: Kind
}

export default function TxnSheet({ kind }: Props) {
  const nav = useNavigate()
  const [companies, setCompanies] = useState<Company[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [traces, setTraces] = useState<string[]>([])
  const [companyQuery, setCompanyQuery] = useState('')
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [txnDate, setTxnDate] = useState(todayISO())
  const [traceNo, setTraceNo] = useState('')
  const [prevBalance, setPrevBalance] = useState(0)
  const [lines, setLines] = useState<DraftLine[]>([emptyLine(), emptyLine(), emptyLine()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const taxMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.product_name, p.tax_type])),
    [products],
  )

  const summary = useMemo(
    () => summarize(lines, taxMap, prevBalance),
    [lines, taxMap, prevBalance],
  )

  const partnerLabel = kind === 'sales' ? '거래처' : '매입처'
  const dateLabel = kind === 'sales' ? '매출일' : '매입일'
  const totalLabel = kind === 'sales' ? '매출합계' : '매입합계'
  const payLabel = kind === 'sales' ? '입금' : '지급'
  const accent = kind === 'sales' ? 'sales' : 'purchase'

  useEffect(() => {
    api.products().then(setProducts).catch(() => {})
    api.traces().then(setTraces).catch(() => {})
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      api.companies(companyQuery).then(setCompanies).catch(() => {})
    }, 200)
    return () => clearTimeout(t)
  }, [companyQuery])

  const pickCompany = useCallback(
    async (name: string) => {
      setCompanyQuery(name)
      const hit = companies.find((c) => c.company_name === name)
      if (!hit) {
        setCompanyId(null)
        setPrevBalance(0)
        return
      }
      setCompanyId(hit.id)
      try {
        const bal =
          kind === 'sales'
            ? await api.salesBalance(hit.id, txnDate)
            : await api.purchaseBalance(hit.id, txnDate)
        setPrevBalance(bal.prev_balance)
      } catch {
        setPrevBalance(hit.base_balance || 0)
      }
    },
    [companies, kind, txnDate],
  )

  useEffect(() => {
    if (companyId) {
      const name = companies.find((c) => c.id === companyId)?.company_name || companyQuery
      if (name) pickCompany(name)
    }
  }, [txnDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setError('')
    if (!companyId) {
      setError(`등록된 ${partnerLabel}를 선택하세요.`)
      return
    }
    const payloadItems = lines
      .filter((l) => l.product_name.trim())
      .map((l) => ({
        product_name: l.product_name.trim(),
        spec: l.spec,
        unit_price: l.unit_price,
        qty: l.qty || 0,
        tax_type: taxMap[l.product_name.trim()],
      }))
    if (!payloadItems.length) {
      setError('품목을 1건 이상 입력하세요.')
      return
    }
    setSaving(true)
    try {
      if (kind === 'sales') {
        await api.createSale({
          company_id: companyId,
          sales_date: txnDate,
          trace_no: traceNo,
          items: payloadItems,
          payment: summary.payment,
        })
        nav('/sales')
      } else {
        await api.createPurchase({
          company_id: companyId,
          purchase_date: txnDate,
          trace_no: traceNo,
          items: payloadItems,
          payment: summary.payment,
        })
        nav('/purchase')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`sheet sheet--${accent}`}>
      <header className="sheet__header">
        <button type="button" className="sheet__back" onClick={() => nav(kind === 'sales' ? '/sales' : '/purchase')}>
          ←
        </button>
        <h1>{kind === 'sales' ? '매출 등록' : '매입 등록'}</h1>
      </header>

      <section className="sheet__meta">
        <label className="field">
          <span>{partnerLabel}</span>
          <input
            value={companyQuery}
            list="company-list"
            placeholder="거래처명 검색"
            onChange={(e) => {
              setCompanyQuery(e.target.value)
              pickCompany(e.target.value)
            }}
          />
          <datalist id="company-list">
            {companies.map((c) => (
              <option key={c.id} value={c.company_name} />
            ))}
          </datalist>
        </label>
        <label className="field">
          <span>{dateLabel}</span>
          <input type="date" value={txnDate} onChange={(e) => setTxnDate(e.target.value)} />
        </label>
        <label className="field">
          <span>이력번호</span>
          <select value={traceNo} onChange={(e) => setTraceNo(e.target.value)}>
            <option value="">—</option>
            {traces.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </section>

      <datalist id="product-list">
        {products.map((p) => (
          <option key={p.id} value={p.product_name} />
        ))}
      </datalist>

      <LineGrid kind={kind} lines={lines} taxMap={taxMap} onChange={setLines} />

      {error && <p className="sheet__error">{error}</p>}
      {!companyId && companyQuery.trim() && (
        <p className="sheet__hint">
          등록되지 않은 거래처입니다. <Link to="/companies/new">거래처 등록</Link>
        </p>
      )}

      <footer className="sheet__footer">
        <div className="summary">
          <div>
            <small>전잔액</small>
            <strong>{won(prevBalance)}</strong>
          </div>
          <div>
            <small>{totalLabel}</small>
            <strong>{won(summary.total)}</strong>
          </div>
          <div>
            <small>{payLabel}</small>
            <strong>{won(summary.payment)}</strong>
          </div>
          <div className="summary__balance">
            <small>잔액</small>
            <strong>{won(summary.balance)}</strong>
          </div>
        </div>
        <button type="button" className={`btn btn--primary btn--${accent}`} disabled={saving} onClick={save}>
          {saving ? '저장 중…' : '저장'}
        </button>
      </footer>
    </div>
  )
}
