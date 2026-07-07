const API_BASE = import.meta.env.VITE_API_BASE ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `API ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export type OutstandingBalance = {
  id: number
  company_code: string
  company_name: string
  balance: number
}

export type Company = {
  id: number
  company_code: string
  company_name: string
  biz_no?: string | null
  ceo_name?: string | null
  business_type?: string | null
  business_item?: string | null
  phone: string | null
  manager_name: string | null
  manager_mobile?: string | null
  address?: string | null
  base_balance: number
  tax_invoice_yn?: string
}

export type Product = {
  id: number
  product_code: string
  product_name: string
  spec: string
  origin?: string
  pouch_content?: string
  cold_type?: string
  tax_type: string
  product_report_no?: string
}

export type LineItem = {
  product_id?: number
  product_name: string
  spec: string
  unit_price: number
  qty: number | string
  amount?: number
  tax_amount?: number
  tax_type?: string
}

export type TxnRow = {
  id: number
  company_id: number
  company_name: string
  txn_date?: string
  sales_date?: string
  purchase_date?: string
  trace_no: string
  prev_balance: number
  total_amount: number
  payment: number
  balance: number
  items?: LineItem[]
}

export type Dashboard = {
  sales_month_total: number
  sales_month_payment: number
  sales_month_count: number
  purchase_month_total: number
  purchase_month_payment: number
  purchase_month_count: number
}

export const api = {
  health: () => request<{ status: string }>('/api/health'),
  dashboard: () => request<Dashboard>('/api/dashboard'),
  companies: (q = '') => request<Company[]>(`/api/companies?q=${encodeURIComponent(q)}`),
  getCompany: (id: number) => request<Company>(`/api/companies/${id}`),
  createCompany: (body: object) =>
    request<Company>('/api/companies', { method: 'POST', body: JSON.stringify(body) }),
  updateCompany: (id: number, body: object) =>
    request<Company>(`/api/companies/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  products: (q = '') => request<Product[]>(`/api/products?q=${encodeURIComponent(q)}`),
  createProduct: (body: object) =>
    request<Product>('/api/products', { method: 'POST', body: JSON.stringify(body) }),
  traces: () => request<string[]>('/api/traces'),
  salesBalance: (companyId: number, date: string) =>
    request<{ prev_balance: number }>(
      `/api/balance/sales?company_id=${companyId}&as_of_date=${date}`,
    ),
  purchaseBalance: (companyId: number, date: string) =>
    request<{ prev_balance: number }>(
      `/api/balance/purchase?company_id=${companyId}&as_of_date=${date}`,
    ),
  sales: (params?: { company_id?: number }) => {
    const q = params?.company_id ? `?company_id=${params.company_id}` : ''
    return request<TxnRow[]>(`/api/sales${q}`)
  },
  createSale: (body: object) =>
    request<TxnRow>('/api/sales', { method: 'POST', body: JSON.stringify(body) }),
  deleteSale: (id: number) => request(`/api/sales/${id}`, { method: 'DELETE' }),
  purchases: () => request<TxnRow[]>(`/api/purchases`),
  createPurchase: (body: object) =>
    request<TxnRow>('/api/purchases', { method: 'POST', body: JSON.stringify(body) }),
  deletePurchase: (id: number) => request(`/api/purchases/${id}`, { method: 'DELETE' }),
  receivables: (asOfDate: string, q = '') => {
    const params = new URLSearchParams()
    if (asOfDate) params.set('as_of_date', asOfDate)
    if (q) params.set('q', q)
    const qs = params.toString()
    return request<OutstandingBalance[]>(`/api/receivables${qs ? `?${qs}` : ''}`)
  },
  payables: (asOfDate: string, q = '') => {
    const params = new URLSearchParams()
    if (asOfDate) params.set('as_of_date', asOfDate)
    if (q) params.set('q', q)
    const qs = params.toString()
    return request<OutstandingBalance[]>(`/api/payables${qs ? `?${qs}` : ''}`)
  },
}
