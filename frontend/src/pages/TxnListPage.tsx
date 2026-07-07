import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type TxnRow } from '../lib/api'
import { txnDate, won } from '../lib/format'

type Props = {
  kind: 'sales' | 'purchase'
}

export default function TxnListPage({ kind }: Props) {
  const [rows, setRows] = useState<TxnRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const accent = kind === 'sales' ? 'sales' : 'purchase'
  const title = kind === 'sales' ? '매출' : '매입'
  const newPath = kind === 'sales' ? '/sales/new' : '/purchase/new'

  const load = () => {
    setLoading(true)
    const req = kind === 'sales' ? api.sales() : api.purchases()
    req
      .then(setRows)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [kind])

  const remove = async (id: number) => {
    if (!confirm('이 거래를 삭제할까요?')) return
    try {
      if (kind === 'sales') await api.deleteSale(id)
      else await api.deletePurchase(id)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제 실패')
    }
  }

  return (
    <div className={`list-page list-page--${accent}`}>
      <div className="list-page__top">
        <div>
          <h1>{title}</h1>
          <p>거래 목록 · 잔액 추적</p>
        </div>
        <Link to={newPath} className={`btn btn--primary btn--${accent}`}>
          + 등록
        </Link>
      </div>

      {loading && <p className="muted">불러오는 중…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="txn-cards">
          {rows.length === 0 ? (
            <div className="empty-card">
              <p>등록된 {title}이 없습니다.</p>
              <Link to={newPath} className={`btn btn--primary btn--${accent}`}>
                첫 {title} 등록
              </Link>
            </div>
          ) : (
            rows.map((r) => (
              <article key={r.id} className="txn-card">
                <div className="txn-card__head">
                  <div>
                    <strong>{r.company_name}</strong>
                    <time>{txnDate(r)}</time>
                  </div>
                  <button type="button" className="txn-card__del" onClick={() => remove(r.id)}>
                    삭제
                  </button>
                </div>
                <dl className="txn-card__stats">
                  <div>
                    <dt>합계</dt>
                    <dd>{won(r.total_amount)}</dd>
                  </div>
                  <div>
                    <dt>{kind === 'sales' ? '입금' : '지급'}</dt>
                    <dd>{won(r.payment)}</dd>
                  </div>
                  <div>
                    <dt>잔액</dt>
                    <dd className="txn-card__balance">{won(r.balance)}</dd>
                  </div>
                </dl>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  )
}
