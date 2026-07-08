import { useTabs } from '../context/TabContext'
import HomePanel from './HomePanel'
import TxnListPanel from './TxnListPanel'
import TxnFormPanel from './TxnFormPanel'
import CompaniesPanel from './CompaniesPanel'
import ProductsPanel from './ProductsPanel'
import OutstandingPanel from './OutstandingPanel'

export default function TabPanel() {
  const { activeTab } = useTabs()

  switch (activeTab.kind) {
    case 'home':
      return <HomePanel />
    case 'sales-list':
      return <TxnListPanel kind="sales" />
    case 'sales-new':
      return <TxnFormPanel kind="sales" />
    case 'sales-receivables':
      return <OutstandingPanel kind="receivables" />
    case 'purchase-list':
      return <TxnListPanel kind="purchase" />
    case 'purchase-new':
      return <TxnFormPanel kind="purchase" />
    case 'purchase-payables':
      return <OutstandingPanel kind="payables" />
    case 'companies':
      return <CompaniesPanel />
    case 'products':
      return <ProductsPanel />
    default:
      return <HomePanel />
  }
}
