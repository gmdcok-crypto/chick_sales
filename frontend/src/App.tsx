import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SalesPage from './pages/SalesPage'
import CompaniesPage from './pages/CompaniesPage'
import ProductsPage from './pages/ProductsPage'
import PurchasePage from './pages/PurchasePage'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="purchase" element={<PurchasePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
