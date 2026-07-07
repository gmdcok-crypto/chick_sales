import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type TabKind =
  | 'home'
  | 'sales-list'
  | 'sales-new'
  | 'purchase-list'
  | 'purchase-new'
  | 'companies'
  | 'company-new'
  | 'products'
  | 'product-new'

export type ErpTab = {
  id: string
  kind: TabKind
  title: string
  closable: boolean
}

const SINGLETON: TabKind[] = ['home', 'sales-list', 'purchase-list', 'companies', 'products']

const DEFAULT_TITLES: Record<TabKind, string> = {
  home: '홈',
  'sales-list': '매출관리',
  'sales-new': '매출등록',
  'purchase-list': '매입관리',
  'purchase-new': '매입등록',
  companies: '거래처관리',
  'company-new': '거래처등록',
  products: '품목관리',
  'product-new': '품목등록',
}

type TabContextValue = {
  tabs: ErpTab[]
  activeId: string
  activeTab: ErpTab
  openTab: (kind: TabKind, title?: string) => void
  closeTab: (id: string) => void
  setActive: (id: string) => void
}

const TabContext = createContext<TabContextValue | null>(null)

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<ErpTab[]>([
    { id: 'home', kind: 'home', title: '홈', closable: false },
  ])
  const [activeId, setActiveId] = useState('home')

  const openTab = useCallback((kind: TabKind, title?: string) => {
    setTabs((prev) => {
      if (SINGLETON.includes(kind)) {
        const existing = prev.find((t) => t.kind === kind)
        if (existing) {
          setActiveId(existing.id)
          return prev
        }
      }
      const id = `${kind}-${Date.now()}`
      setActiveId(id)
      return [
        ...prev,
        {
          id,
          kind,
          title: title || DEFAULT_TITLES[kind],
          closable: kind !== 'home',
        },
      ]
    })
  }, [])

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      const tab = prev.find((t) => t.id === id)
      if (!tab || !tab.closable) return prev
      const next = prev.filter((t) => t.id !== id)
      if (activeId === id) {
        const idx = prev.findIndex((t) => t.id === id)
        const fallback = next[Math.max(0, idx - 1)] ?? next[0]
        setActiveId(fallback?.id ?? 'home')
      }
      return next.length ? next : prev
    })
  }, [activeId])

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0]

  const value = useMemo(
    () => ({
      tabs,
      activeId,
      activeTab,
      openTab,
      closeTab,
      setActive: setActiveId,
    }),
    [tabs, activeId, activeTab, openTab, closeTab],
  )

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>
}

export function useTabs() {
  const ctx = useContext(TabContext)
  if (!ctx) throw new Error('useTabs outside TabProvider')
  return ctx
}
