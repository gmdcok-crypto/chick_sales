import { useEffect, useState } from 'react'
import DataGrid, { type Column } from '../components/erp/DataGrid'
import { api, type Product } from '../lib/api'
import { useTabs } from '../context/TabContext'

export default function ProductsPanel() {
  const { openTab } = useTabs()
  const [rows, setRows] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = (q = filter) => {
    setLoading(true)
    api
      .products(q)
      .then(setRows)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const t = setTimeout(() => load(filter), 200)
    return () => clearTimeout(t)
  }, [filter])

  const columns: Column<Product>[] = [
    { key: 'product_code', title: '품목코드', width: 88 },
    { key: 'product_name', title: '품목명', width: 140 },
    { key: 'spec', title: '규격', width: 72 },
    { key: 'origin', title: '원산지', width: 72, render: (r) => r.origin || '' },
    { key: 'cold_type', title: '보관', width: 52, align: 'center', render: (r) => r.cold_type || '' },
    { key: 'tax_type', title: '과세', width: 48, align: 'center' },
    {
      key: 'product_report_no',
      title: '품목제조보고번호',
      width: 120,
      render: (r) => r.product_report_no || '',
    },
    { key: 'pouch_content', title: '파우치', width: 100, render: (r) => r.pouch_content || '' },
  ]

  return (
    <div className="erp-panel">
      <div className="erp-toolbar">
        <span className="erp-toolbar__title">품목관리</span>
        <div className="erp-toolbar__actions">
          <button type="button" className="erp-btn" onClick={() => load()} disabled={loading}>
            조회
          </button>
          <button type="button" className="erp-btn erp-btn--primary" onClick={() => openTab('product-new')}>
            신규
          </button>
        </div>
        <div className="erp-toolbar__filter">
          <label>
            검색
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="품목명·코드·규격"
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
        onDoubleClick={() => openTab('product-new')}
        emptyText={loading ? '불러오는 중…' : '등록된 품목이 없습니다.'}
        footer={<span>{rows.length}건</span>}
      />
    </div>
  )
}
