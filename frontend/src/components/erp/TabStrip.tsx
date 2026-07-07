import { useTabs } from '../../context/TabContext'

export default function TabStrip() {
  const { tabs, activeId, setActive, closeTab } = useTabs()

  return (
    <div className="erp-tabs" role="tablist">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeId}
          className={`erp-tabs__item ${tab.id === activeId ? 'erp-tabs__item--active' : ''}`}
          onClick={() => setActive(tab.id)}
        >
          <span className="erp-tabs__title">{tab.title}</span>
          {tab.closable && (
            <button
              type="button"
              className="erp-tabs__close"
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
              aria-label="탭 닫기"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
