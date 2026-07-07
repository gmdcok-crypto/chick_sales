import { useEffect, useState } from 'react'
import { api } from '../api'

export default function HomePage() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [db, setDb] = useState('')

  useEffect(() => {
    api
      .health()
      .then((r) => {
        setDb(r.database)
        setStatus('ok')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <section className="page">
      <h2>대시보드</h2>
      <p className="lead">
        <code>d:\sister</code> PyQt 프로그램과 동일한 MariaDB를 사용하는 웹/PWA 버전입니다.
      </p>
      <div className="card-grid">
        <article className="card">
          <h3>서버 연결</h3>
          {status === 'loading' && <p>확인 중…</p>}
          {status === 'ok' && (
            <p className="ok">
              API 정상 · DB: <strong>{db}</strong>
            </p>
          )}
          {status === 'error' && (
            <p className="error">
              API에 연결할 수 없습니다. 백엔드를 실행했는지 확인하세요.
            </p>
          )}
        </article>
        <article className="card">
          <h3>구현 예정 (sister 기준)</h3>
          <ul className="feature-list">
            <li>거래처·품목·매출 관리</li>
            <li>거래처 원장 / 미수</li>
            <li>입금·출고·계산서·시세</li>
            <li>매입 모듈 (신규)</li>
          </ul>
        </article>
      </div>
    </section>
  )
}
