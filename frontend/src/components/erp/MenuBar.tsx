import { useTabs } from '../../context/TabContext'

const MENUS = [
  {
    label: '매출',
    items: [
      { kind: 'sales-list' as const, label: '매출관리' },
      { kind: 'sales-new' as const, label: '매출등록' },
    ],
  },
  {
    label: '매입',
    items: [
      { kind: 'purchase-list' as const, label: '매입관리' },
      { kind: 'purchase-new' as const, label: '매입등록' },
    ],
  },
  {
    label: '거래처',
    items: [
      { kind: 'companies' as const, label: '거래처관리' },
      { kind: 'company-new' as const, label: '거래처등록' },
    ],
  },
]

export default function MenuBar() {
  const { openTab } = useTabs()

  return (
    <div className="erp-menu">
      <div className="erp-menu__brand">Chick Sales ERP</div>
      <nav className="erp-menu__nav">
        {MENUS.map((menu) => (
          <div key={menu.label} className="erp-menu__group">
            <span className="erp-menu__label">{menu.label}</span>
            {menu.items.map((item) => (
              <button
                key={item.kind}
                type="button"
                className="erp-menu__item"
                onClick={() => openTab(item.kind)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </div>
  )
}
