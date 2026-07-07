import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, type Company, type Product } from '../lib/api'
import { todayISO, won } from '../lib/format'
import { emptyLine, linePreview, summarize, type DraftLine } from '../lib/txnCalc'

type Kind = 'sales' | 'purchase'

type Props = {
  kind: Kind
  onSaved?: () => void
  onOpenCompany?: () => void
}

export function useTxnForm({ kind, onSaved }: Pick<Props, 'kind' | 'onSaved'>) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [traces, setTraces] = useState<string[]>([])
  const [companyQuery, setCompanyQuery] = useState('')
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [txnDate, setTxnDate] = useState(todayISO())
  const [traceNo, setTraceNo] = useState('')
  const [prevBalance, setPrevBalance] = useState(0)
  const [lines, setLines] = useState<DraftLine[]>(() =>
    Array.from({ length: 8 }, emptyLine),
  )
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

  useEffect(() => {
    api.products().then(setProducts).catch(() => {})
    api.traces().then(setTraces).catch(() => {})
    api.companies().then(setCompanies).catch(() => {})
  }, [])

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

  const updateLine = (idx: number, patch: Partial<DraftLine>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }

  const addLine = () => setLines((prev) => [...prev, emptyLine()])
  const addDeposit = () =>
    setLines((prev) => [...prev, { product_name: '입금', spec: '', unit_price: 0, qty: '' }])

  const save = async () => {
    setError('')
    if (!companyId) {
      setError('등록된 거래처를 선택하세요.')
      return false
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
      setError('품목 1건 이상 입력하세요.')
      return false
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
      } else {
        await api.createPurchase({
          company_id: companyId,
          purchase_date: txnDate,
          trace_no: traceNo,
          items: payloadItems,
          payment: summary.payment,
        })
      }
      onSaved?.()
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
      return false
    } finally {
      setSaving(false)
    }
  }

  return {
    kind,
    companies,
    products,
    traces,
    companyQuery,
    setCompanyQuery,
    companyId,
    pickCompany,
    txnDate,
    setTxnDate,
    traceNo,
    setTraceNo,
    prevBalance,
    lines,
    setLines,
    updateLine,
    addLine,
    addDeposit,
    taxMap,
    summary,
    saving,
    error,
    save,
    linePreview,
    won,
  }
}
