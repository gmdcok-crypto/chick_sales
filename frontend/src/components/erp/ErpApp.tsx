import { useEffect } from 'react'
import { TabProvider, useTabs } from '../../context/TabContext'
import SideMenu from './SideMenu'
import TabStrip from './TabStrip'
import TabPanel from '../../panels/TabPanel'

function ErpBody() {
  const { openTab } = useTabs()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault()
        // refresh handled per panel
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="erp-shell">
      <SideMenu />
      <div className="erp-main">
        <TabStrip />
        <div className="erp-workspace">
          <TabPanel />
        </div>
        <div className="erp-footer">
          <span>Chick Sales ERP</span>
          <button type="button" className="erp-footer__link" onClick={() => openTab('home')}>
            홈
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ErpApp() {
  return (
    <TabProvider>
      <ErpBody />
    </TabProvider>
  )
}
