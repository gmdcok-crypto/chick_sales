import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Company } from '../lib/api'
import { won } from '../lib/format'

export default function CompaniesPage() {
  const [rows, setRows] = useState<Company[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      api
        .companies(q)
        .then(setRows)
        .finally(() => setLoading(false))
    }, 200)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div className="list-page">
      <div className="list-page__top">
        <div>
          <h1>거래처</h1>
          <p>매출·매입 공통 거래처</p>
        </div>
        <Link to="/companies/new" className="btn btn--primary btn--neutral">
          + 등록
        </Link>
      </div>

      <div className="search-bar">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="거래처명 검색"
          aria-label="거래처 검색"
        />
      </div>

      {loading && <p className="muted">불러오는 중…</p>}

      {!loading && (
        <div className="txn-cards">
          {rows.length === 0 ? (
            <div className="empty-card">
              <p>{q ? '검색 결과가 없습니다.' : '등록된 거래처가 없습니다.'}</p>
              <Link to="/companies/new" className="btn btn--primary btn--neutral">
                거래처 등록
              </Link>
            </div>
          ) : (
            rows.map((c) => (
              <article key={c.id} className="company-card">
                <div className="company-card__head">
                  <div>
                    <span className="company-card__code">{c.company_code}</span>
                    <strong>{c.company_name}</strong>
                  </div>
                  <span className="company-card__balance">{won(c.base_balance)}</span>
                </div>
                <dl className="company-card__meta">
                  {c.manager_name && (
                    <div>
                      <dt>담당</dt>
                      <dd>{c.manager_name}</dd>
                    </div>
                  )}
                  {c.phone && (
                    <div>
                      <dt>전화</dt>
                      <dd>{c.phone}</dd>
                    </div>
                  )}
                  {c.biz_no && (
                    <div>
                      <dt>사업자</dt>
                      <dd>{c.biz_no}</dd>
                    </div>
                  )}
                </dl>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  )
}
