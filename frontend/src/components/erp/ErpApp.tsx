import { useEffect } from 'react'
import { TabProvider } from '../../context/TabContext'
import SideMenu from './SideMenu'
import TabPanel from '../../panels/TabPanel'

function ErpBody() {

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
    <div className="erp-shell" data-pencil-layer="shell">
      <SideMenu />
      <div className="erp-main" data-pencil-layer="main">
        <div className="erp-workspace" data-pencil-layer="workspace">
          <TabPanel />
        </div>
        <div className="erp-footer" data-pencil-layer="footer">
          <span>Chick Sales ERP</span>
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
