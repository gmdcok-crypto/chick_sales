import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/', label: '홈', end: true },
  { to: '/sales', label: '매출' },
  { to: '/companies', label: '거래처' },
  { to: '/products', label: '품목' },
  { to: '/purchase', label: '매입' },
]

export default function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Chick Sales</h1>
        <p className="subtitle">매출·매입 PWA</p>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="메인 메뉴">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
