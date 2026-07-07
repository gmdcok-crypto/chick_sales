import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import TxnSheet from './components/TxnSheet'
import HomePage from './pages/HomePage'
import TxnListPage from './pages/TxnListPage'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="sales" element={<TxnListPage kind="sales" />} />
          <Route path="sales/new" element={<TxnSheet kind="sales" />} />
          <Route path="purchase" element={<TxnListPage kind="purchase" />} />
          <Route path="purchase/new" element={<TxnSheet kind="purchase" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
