import { useEffect, useMemo, useState } from 'react'
import DataGrid, { type Column } from '../components/erp/DataGrid'
import { api, type OutstandingBalance } from '../lib/api'
import { won } from '../lib/format'

type Kind = 'receivables' | 'payables'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function OutstandingPanel({ kind }: { kind: Kind }) {
  const isReceivables = kind === 'receivables'
  const title = isReceivables ? '미수금' : '미지급금'
  const amountLabel = isReceivables ? '미수금' : '미지급금'

  const [rows, setRows] = useState<OutstandingBalance[]>([])
  const [asOfDate, setAsOfDate] = useState(today)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const req = isReceivables
      ? api.receivables(asOfDate, filter)
      : api.payables(asOfDate, filter)
    req
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [kind])

  const columns: Column<OutstandingBalance>[] = [
    { key: 'company_code', title: '코드', width: 80 },
    { key: 'company_name', title: isReceivables ? '거래처' : '매입처', width: 200 },
    {
      key: 'balance',
      title: amountLabel,
      width: 140,
      align: 'right',
      render: (r) => won(r.balance),
    },
  ]

  const total = useMemo(() => rows.reduce((a, r) => a + (r.balance || 0), 0), [rows])

  return (
    <div className="erp-panel">
      <div className="erp-toolbar">
        <span className="erp-toolbar__title">{title}</span>
        <div className="erp-toolbar__actions">
          <button type="button" className="erp-btn" onClick={load} disabled={loading}>
            조회(F5)
          </button>
        </div>
        <div className="erp-toolbar__filter">
          <label>
            기준일
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
            />
          </label>
          <label>
            업체명
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="전체"
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </label>
        </div>
      </div>

      <DataGrid
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        emptyText={loading ? '불러오는 중…' : `${title} 내역이 없습니다.`}
        footer={
          <span>
            {rows.length}건 · {amountLabel} 합계 <strong>{won(total)}</strong>
          </span>
        }
      />
    </div>
  )
}
