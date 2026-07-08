import { useEffect, useState } from 'react'
import { useTabs, type TabKind } from '../../context/TabContext'

type MenuLeaf = { kind: TabKind; label: string }
type MenuGroup = { label: string; items: MenuLeaf[] }

const MENUS: MenuGroup[] = [
  {
    label: '거래처',
    items: [{ kind: 'companies', label: '거래처관리' }],
  },
  {
    label: '품목',
    items: [
      { kind: 'products', label: '품목관리' },
      { kind: 'product-new', label: '품목등록' },
    ],
  },
  {
    label: '매출',
    items: [
      { kind: 'sales-list', label: '매출관리' },
      { kind: 'sales-new', label: '매출등록' },
      { kind: 'sales-receivables', label: '미수금' },
    ],
  },
  {
    label: '매입',
    items: [
      { kind: 'purchase-list', label: '매입관리' },
      { kind: 'purchase-new', label: '매입등록' },
      { kind: 'purchase-payables', label: '미지급금' },
    ],
  },
]

const GROUP_KEYS = MENUS.map((m) => m.label)

function isGroupActive(kind: TabKind, group: MenuGroup) {
  return group.items.some((item) => item.kind === kind)
}

export default function SideMenu() {
  const { openTab, activeTab } = useTabs()
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GROUP_KEYS.map((k) => [k, true])),
  )

  const toggle = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  useEffect(() => {
    const group = MENUS.find((g) => isGroupActive(activeTab.kind, g))
    if (group) {
      setExpanded((prev) => ({ ...prev, [group.label]: true }))
    }
  }, [activeTab.kind])

  return (
    <aside className="erp-sidebar" data-pencil-layer="sidebar">
      <div className="erp-sidebar__brand" data-pencil-layer="sidebar-brand">Chick Sales ERP</div>
      <nav className="erp-tree" aria-label="메뉴" data-pencil-layer="tree-menu">
        <button
          type="button"
          className={`erp-tree__item erp-tree__item--root${activeTab.kind === 'home' ? ' erp-tree__item--active' : ''}`}
          onClick={() => openTab('home')}
        >
          <span className="erp-tree__icon">▪</span>
          <span className="erp-tree__label">홈</span>
        </button>

        {MENUS.map((group) => {
          const open = expanded[group.label] ?? true
          const groupActive = isGroupActive(activeTab.kind, group)

          return (
            <div key={group.label} className="erp-tree__group">
              <button
                type="button"
                className={`erp-tree__item erp-tree__item--branch${groupActive ? ' erp-tree__item--parent-active' : ''}`}
                onClick={() => toggle(group.label)}
                aria-expanded={open}
              >
                <span className="erp-tree__toggle">{open ? '▼' : '▶'}</span>
                <span className="erp-tree__label">{group.label}</span>
              </button>
              {open && (
                <div className="erp-tree__children">
                  {group.items.map((item) => (
                    <button
                      key={item.kind}
                      type="button"
                      className={`erp-tree__item erp-tree__item--leaf${activeTab.kind === item.kind ? ' erp-tree__item--active' : ''}`}
                      onClick={() => openTab(item.kind)}
                    >
                      <span className="erp-tree__icon">·</span>
                      <span className="erp-tree__label">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
