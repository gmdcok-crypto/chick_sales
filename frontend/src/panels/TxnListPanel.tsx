import { useEffect, useMemo, useState } from 'react'
import DataGrid, { type Column } from '../components/erp/DataGrid'
import { api, type TxnRow } from '../lib/api'
import { txnDate, won } from '../lib/format'
import { useTabs } from '../context/TabContext'

type Kind = 'sales' | 'purchase'

export default function TxnListPanel({ kind }: { kind: Kind }) {
  const { openTab } = useTabs()
  const [rows, setRows] = useState<TxnRow[]>([])
  const [selected, setSelected] = useState<TxnRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const title = kind === 'sales' ? '매출관리' : '매입관리'

  const load = () => {
    setLoading(true)
    const req = kind === 'sales' ? api.sales() : api.purchases()
    req
      .then(setRows)
      .finally(() => setLoading(false))
  }

  useEffect(load, [kind])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.company_name.toLowerCase().includes(q) ||
        txnDate(r).includes(q) ||
        String(r.id).includes(q),
    )
  }, [rows, filter])

  const remove = async () => {
    if (!selected) return
    if (!confirm('선택한 거래를 삭제할까요?')) return
    try {
      if (kind === 'sales') await api.deleteSale(selected.id)
      else await api.deletePurchase(selected.id)
      setSelected(null)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제 실패')
    }
  }

  const columns: Column<TxnRow>[] = [
    { key: 'id', title: '번호', width: 64, align: 'right' },
    { key: 'date', title: kind === 'sales' ? '매출일' : '매입일', width: 100, render: (r) => txnDate(r) },
    { key: 'company_name', title: kind === 'sales' ? '거래처' : '매입처' },
    { key: 'trace_no', title: '이력번호', width: 130 },
    { key: 'prev_balance', title: '전잔액', width: 110, align: 'right', render: (r) => won(r.prev_balance) },
    { key: 'total_amount', title: '합계', width: 110, align: 'right', render: (r) => won(r.total_amount) },
    {
      key: 'payment',
      title: kind === 'sales' ? '입금' : '지급',
      width: 110,
      align: 'right',
      render: (r) => won(r.payment),
    },
    { key: 'balance', title: '잔액', width: 120, align: 'right', render: (r) => won(r.balance) },
  ]

  const totals = useMemo(
    () => ({
      sum: filtered.reduce((a, r) => a + r.total_amount, 0),
      pay: filtered.reduce((a, r) => a + r.payment, 0),
    }),
    [filtered],
  )

  return (
    <div className="erp-panel">
      <div className="erp-toolbar">
        <span className="erp-toolbar__title">{title}</span>
        <div className="erp-toolbar__actions">
          <button type="button" className="erp-btn" onClick={load} disabled={loading}>
            조회(F5)
          </button>
          <button
            type="button"
            className="erp-btn erp-btn--primary"
            onClick={() => openTab(kind === 'sales' ? 'sales-new' : 'purchase-new')}
          >
            신규
          </button>
          <button type="button" className="erp-btn erp-btn--danger" onClick={remove} disabled={!selected}>
            삭제
          </button>
        </div>
        <div className="erp-toolbar__filter">
          <label>
            검색
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="거래처·일자·번호"
            />
          </label>
        </div>
      </div>

      <DataGrid
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        selectedKey={selected?.id ?? null}
        onSelect={setSelected}
        emptyText={loading ? '불러오는 중…' : '등록된 거래가 없습니다.'}
        footer={
          <span>
            {filtered.length}건 · 합계 <strong>{won(totals.sum)}</strong> ·{' '}
            {kind === 'sales' ? '입금' : '지급'} <strong>{won(totals.pay)}</strong>
          </span>
        }
      />
    </div>
  )
}
