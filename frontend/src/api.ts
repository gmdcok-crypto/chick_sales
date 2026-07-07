const API_BASE = import.meta.env.VITE_API_BASE ?? ''

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}

export type Company = {
  id: number
  company_code: string
  company_name: string
  phone: string | null
  manager_name: string | null
  base_balance: number
  tax_invoice_yn: string
  status: string
}

export type Product = {
  id: number
  product_code: string
  product_name: string
  spec: string
  origin: string
  tax_type: string
  status: string
}

export type Sale = {
  id: number
  company_id: number
  company_name: string
  sales_date: string
  trace_no: string
  txn_type: string
  prev_balance: number
  total_amount: number
  payment: number
  balance: number
}

export type SaleItem = {
  id: number
  product_name: string
  spec: string
  unit_price: number
  qty: number
  amount: number
  tax_amount: number
  trace_no: string
}

export type SaleDetail = Sale & { items: SaleItem[] }

export const api = {
  health: () => request<{ status: string; database: string }>('/api/health'),
  companies: () => request<Company[]>('/api/companies'),
  products: () => request<Product[]>('/api/products'),
  sales: (params?: { company_id?: number; from_date?: string; to_date?: string }) => {
    const q = new URLSearchParams()
    if (params?.company_id) q.set('company_id', String(params.company_id))
    if (params?.from_date) q.set('from_date', params.from_date)
    if (params?.to_date) q.set('to_date', params.to_date)
    const qs = q.toString()
    return request<Sale[]>(`/api/sales${qs ? `?${qs}` : ''}`)
  },
  sale: (id: number) => request<SaleDetail>(`/api/sales/${id}`),
}
