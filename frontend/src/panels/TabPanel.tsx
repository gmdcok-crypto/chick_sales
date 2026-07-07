import { useTabs } from '../context/TabContext'
import HomePanel from './HomePanel'
import TxnListPanel from './TxnListPanel'
import TxnFormPanel from './TxnFormPanel'
import CompaniesPanel from './CompaniesPanel'
import CompanyFormPanel from './CompanyFormPanel'
import ProductsPanel from './ProductsPanel'
import ProductFormPanel from './ProductFormPanel'

export default function TabPanel() {
  const { activeTab } = useTabs()

  switch (activeTab.kind) {
    case 'home':
      return <HomePanel />
    case 'sales-list':
      return <TxnListPanel kind="sales" />
    case 'sales-new':
      return <TxnFormPanel kind="sales" />
    case 'purchase-list':
      return <TxnListPanel kind="purchase" />
    case 'purchase-new':
      return <TxnFormPanel kind="purchase" />
    case 'companies':
      return <CompaniesPanel />
    case 'company-new':
      return <CompanyFormPanel />
    case 'products':
      return <ProductsPanel />
    case 'product-new':
      return <ProductFormPanel />
    default:
      return <HomePanel />
  }
}
