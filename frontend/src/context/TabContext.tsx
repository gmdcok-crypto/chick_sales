import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type TabKind =
  | 'home'
  | 'sales-list'
  | 'sales-new'
  | 'sales-receivables'
  | 'purchase-list'
  | 'purchase-new'
  | 'purchase-payables'
  | 'companies'
  | 'products'
  | 'product-new'

const DEFAULT_TITLES: Record<TabKind, string> = {
  home: '홈',
  'sales-list': '매출관리',
  'sales-new': '매출등록',
  'sales-receivables': '미수금',
  'purchase-list': '매입관리',
  'purchase-new': '매입등록',
  'purchase-payables': '미지급금',
  companies: '거래처관리',
  products: '품목관리',
  'product-new': '품목등록',
}

type NavState = {
  kind: TabKind
  entityId?: number
}

type OpenTabOptions = {
  title?: string
  entityId?: number
}

export type ActiveView = {
  kind: TabKind
  entityId?: number
  title: string
}

type TabContextValue = {
  activeTab: ActiveView
  openTab: (kind: TabKind, options?: OpenTabOptions) => void
}

const TabContext = createContext<TabContextValue | null>(null)

export function TabProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState<NavState>({ kind: 'home' })

  const openTab = useCallback((kind: TabKind, options?: OpenTabOptions) => {
    setNav({ kind, entityId: options?.entityId })
  }, [])

  const activeTab = useMemo<ActiveView>(
    () => ({
      kind: nav.kind,
      entityId: nav.entityId,
      title: DEFAULT_TITLES[nav.kind],
    }),
    [nav],
  )

  const value = useMemo(() => ({ activeTab, openTab }), [activeTab, openTab])

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>
}

export function useTabs() {
  const ctx = useContext(TabContext)
  if (!ctx) throw new Error('useTabs outside TabProvider')
  return ctx
}
