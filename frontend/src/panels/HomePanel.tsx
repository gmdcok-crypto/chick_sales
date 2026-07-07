import { useEffect, useState } from 'react'
import { api, type Dashboard } from '../lib/api'
import { won } from '../lib/format'

export default function HomePanel() {
  const [stats, setStats] = useState<Dashboard | null>(null)

  useEffect(() => {
    api.dashboard().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="erp-panel erp-panel--home">
      <div className="erp-home-stats">
        <div className="erp-home-stat">
          <span>이번 달 매출</span>
          <strong>{won(stats?.sales_month_total ?? 0)}</strong>
          <small>{stats?.sales_month_count ?? 0}건</small>
        </div>
        <div className="erp-home-stat">
          <span>이번 달 매입</span>
          <strong>{won(stats?.purchase_month_total ?? 0)}</strong>
          <small>{stats?.purchase_month_count ?? 0}건</small>
        </div>
      </div>
    </div>
  )
}
