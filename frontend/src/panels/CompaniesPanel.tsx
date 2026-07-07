import { useEffect, useMemo, useState } from 'react'
import DataGrid, { type Column } from '../components/erp/DataGrid'
import { api, type Company } from '../lib/api'
import { won } from '../lib/format'
import { useTabs } from '../context/TabContext'

export default function CompaniesPanel() {
  const { openTab } = useTabs()
  const [rows, setRows] = useState<Company[]>([])
  const [selected, setSelected] = useState<Company | null>(null)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = (q = filter) => {
    setLoading(true)
    api
      .companies(q)
      .then(setRows)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const t = setTimeout(() => load(filter), 200)
    return () => clearTimeout(t)
  }, [filter])

  const columns: Column<Company>[] = [
    { key: 'company_code', title: '코드', width: 80 },
    { key: 'company_name', title: '거래처명', width: 160 },
    { key: 'biz_no', title: '사업자번호', width: 110, render: (r) => r.biz_no || '' },
    { key: 'ceo_name', title: '대표', width: 80, render: (r) => r.ceo_name || '' },
    { key: 'manager_name', title: '담당', width: 80, render: (r) => r.manager_name || '' },
    { key: 'phone', title: '전화', width: 110, render: (r) => r.phone || '' },
    { key: 'base_balance', title: '기초잔액', width: 100, align: 'right', render: (r) => won(r.base_balance) },
    {
      key: 'tax_invoice_yn',
      title: '계산서',
      width: 56,
      align: 'center',
      render: (r) => r.tax_invoice_yn || 'Y',
    },
  ]

  const totalBase = useMemo(
    () => rows.reduce((a, r) => a + (r.base_balance || 0), 0),
    [rows],
  )

  return (
    <div className="erp-panel">
      <div className="erp-toolbar">
        <span className="erp-toolbar__title">거래처관리</span>
        <div className="erp-toolbar__actions">
          <button type="button" className="erp-btn" onClick={() => load()} disabled={loading}>
            조회
          </button>
          <button type="button" className="erp-btn erp-btn--primary" onClick={() => openTab('company-new')}>
            신규
          </button>
        </div>
        <div className="erp-toolbar__filter">
          <label>
            검색
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="거래처명"
            />
          </label>
        </div>
      </div>

      <DataGrid
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        selectedKey={selected?.id ?? null}
        onSelect={setSelected}
        onDoubleClick={() => openTab('company-new')}
        emptyText={loading ? '불러오는 중…' : '등록된 거래처가 없습니다.'}
        footer={
          <span>
            {rows.length}건 · 기초잔액 합계 <strong>{won(totalBase)}</strong>
          </span>
        }
      />
    </div>
  )
}
