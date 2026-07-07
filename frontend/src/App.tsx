import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import TxnSheet from './components/TxnSheet'
import HomePage from './pages/HomePage'
import TxnListPage from './pages/TxnListPage'
import CompaniesPage from './pages/CompaniesPage'
import CompanyNewPage from './pages/CompanyNewPage'
import ErpApp from './components/erp/ErpApp'
import { DESKTOP_QUERY, useMediaQuery } from './hooks/useMediaQuery'
import './index.css'
import './erp.css'

function MobileApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="sales" element={<TxnListPage kind="sales" />} />
          <Route path="sales/new" element={<TxnSheet kind="sales" />} />
          <Route path="purchase" element={<TxnListPage kind="purchase" />} />
          <Route path="purchase/new" element={<TxnSheet kind="purchase" />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/new" element={<CompanyNewPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  return (
    <>
      <div className="desktop-only">{isDesktop && <ErpApp />}</div>
      <div className="mobile-only">{!isDesktop && <MobileApp />}</div>
    </>
  )
}
