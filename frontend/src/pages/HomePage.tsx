import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Dashboard } from '../lib/api'
import { won } from '../lib/format'

export default function HomePage() {
  const [stats, setStats] = useState<Dashboard | null>(null)
  const [online, setOnline] = useState<boolean | null>(null)

  useEffect(() => {
    api
      .health()
      .then(() => setOnline(true))
      .catch(() => setOnline(false))
    api.dashboard().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="home">
      <section className="hero">
        <p className="hero__eyebrow">Chick Sales</p>
        <h1>매출과 매입을<br />한 화면에서</h1>
        <p className="hero__sub">
          sister 검증 로직 기반 · 잔액·세액 자동 계산
        </p>
        <div className="hero__status">
          {online === null && '연결 확인 중…'}
          {online === true && <span className="pill pill--ok">서버 연결됨</span>}
          {online === false && <span className="pill pill--err">오프라인</span>}
        </div>
      </section>

      <section className="stat-grid">
        <article className="stat-card stat-card--sales">
          <span>이번 달 매출</span>
          <strong>{won(stats?.sales_month_total ?? 0)}</strong>
          <small>{stats?.sales_month_count ?? 0}건 · 입금 {won(stats?.sales_month_payment ?? 0)}</small>
        </article>
        <article className="stat-card stat-card--purchase">
          <span>이번 달 매입</span>
          <strong>{won(stats?.purchase_month_total ?? 0)}</strong>
          <small>{stats?.purchase_month_count ?? 0}건 · 지급 {won(stats?.purchase_month_payment ?? 0)}</small>
        </article>
      </section>

      <section className="quick-actions">
        <Link to="/sales/new" className="action-card action-card--sales">
          <span>매출 등록</span>
          <small>거래처 · 품목 · 입금</small>
        </Link>
        <Link to="/purchase/new" className="action-card action-card--purchase">
          <span>매입 등록</span>
          <small>매입처 · 품목 · 지급</small>
        </Link>
      </section>
    </div>
  )
}
