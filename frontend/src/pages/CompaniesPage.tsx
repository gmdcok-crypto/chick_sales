import { useEffect, useState } from 'react'
import { api, type Company } from '../api'

export default function CompaniesPage() {
  const [rows, setRows] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .companies()
      .then(setRows)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="page">
      <h2>거래처</h2>
      {loading && <p>불러오는 중…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>코드</th>
                <th>거래처명</th>
                <th>담당자</th>
                <th>기초잔액</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>{c.company_code}</td>
                  <td>{c.company_name}</td>
                  <td>{c.manager_name ?? '-'}</td>
                  <td className="num">{c.base_balance.toLocaleString('ko-KR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
