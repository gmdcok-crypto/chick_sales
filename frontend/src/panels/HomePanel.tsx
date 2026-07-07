import { useEffect, useState } from 'react'
import { api, type Dashboard } from '../lib/api'
import { won } from '../lib/format'
import { useTabs } from '../context/TabContext'

export default function HomePanel() {
  const { openTab } = useTabs()
  const [stats, setStats] = useState<Dashboard | null>(null)

  useEffect(() => {
    api.dashboard().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="erp-panel erp-panel--home">
      <div className="erp-toolbar">
        <span className="erp-toolbar__title">대시보드</span>
      </div>
      <div className="erp-home-grid">
        <button type="button" className="erp-home-tile" onClick={() => openTab('sales-list')}>
          <strong>매출관리</strong>
          <span>이번 달 {won(stats?.sales_month_total ?? 0)}</span>
          <small>{stats?.sales_month_count ?? 0}건</small>
        </button>
        <button type="button" className="erp-home-tile" onClick={() => openTab('purchase-list')}>
          <strong>매입관리</strong>
          <span>이번 달 {won(stats?.purchase_month_total ?? 0)}</span>
          <small>{stats?.purchase_month_count ?? 0}건</small>
        </button>
        <button type="button" className="erp-home-tile" onClick={() => openTab('companies')}>
          <strong>거래처관리</strong>
          <span>등록 · 조회</span>
        </button>
        <button type="button" className="erp-home-tile erp-home-tile--accent" onClick={() => openTab('sales-new')}>
          <strong>+ 매출등록</strong>
        </button>
        <button type="button" className="erp-home-tile erp-home-tile--accent2" onClick={() => openTab('purchase-new')}>
          <strong>+ 매입등록</strong>
        </button>
      </div>
    </div>
  )
}
