import { useEffect, useState } from 'react'
import { api, type Sale } from '../api'

function won(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}

export default function SalesPage() {
  const [rows, setRows] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .sales()
      .then(setRows)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="page">
      <h2>매출 관리</h2>
      {loading && <p>불러오는 중…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>일자</th>
                <th>거래처</th>
                <th>매출액</th>
                <th>입금</th>
                <th>잔액</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">
                    매출 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>{String(r.sales_date).slice(0, 10)}</td>
                    <td>{r.company_name}</td>
                    <td className="num">{won(r.total_amount)}</td>
                    <td className="num">{won(r.payment)}</td>
                    <td className="num">{won(r.balance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
