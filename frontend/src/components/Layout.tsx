import { NavLink, Outlet, useLocation } from 'react-router-dom'

const nav = [
  { to: '/', label: '홈', end: true },
  { to: '/sales', label: '매출' },
  { to: '/purchase', label: '매입' },
  { to: '/companies', label: '거래처' },
]

export default function Layout() {
  const loc = useLocation()
  const isSheet = /\/(new|edit)/.test(loc.pathname)

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">CS</span>
          <div>
            <strong>Chick Sales</strong>
            <span>매출 · 매입</span>
          </div>
        </div>
      </header>

      <main className={`main ${isSheet ? 'main--sheet' : ''}`}>
        <Outlet />
      </main>

      {!isSheet && (
        <nav className="tabbar" aria-label="메인">
          {nav.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className="tabbar__item">
              {t.label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
