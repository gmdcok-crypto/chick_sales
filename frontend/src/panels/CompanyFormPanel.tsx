import { useState } from 'react'
import { api } from '../lib/api'
import { useTabs } from '../context/TabContext'

const empty = {
  company_name: '',
  biz_no: '',
  ceo_name: '',
  business_type: '',
  business_item: '',
  address: '',
  phone: '',
  manager_name: '',
  manager_mobile: '',
  base_balance: 0,
  tax_invoice_yn: 'Y',
}

export default function CompanyFormPanel() {
  const { openTab } = useTabs()
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof empty, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }))

  const save = async () => {
    setError('')
    if (!form.company_name.trim()) {
      setError('거래처명을 입력하세요.')
      return
    }
    setSaving(true)
    try {
      await api.createCompany({
        ...form,
        company_name: form.company_name.trim(),
        base_balance: Number(form.base_balance) || 0,
      })
      setForm(empty)
      openTab('companies')
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="erp-panel erp-panel--form">
      <div className="erp-toolbar">
        <span className="erp-toolbar__title">거래처등록</span>
        <div className="erp-toolbar__actions">
          <button type="button" className="erp-btn erp-btn--primary" disabled={saving} onClick={save}>
            저장
          </button>
          <button type="button" className="erp-btn" onClick={() => setForm(empty)}>
            초기화
          </button>
        </div>
      </div>

      <div className="erp-form-grid">
        <label>
          <span>거래처명 *</span>
          <input value={form.company_name} onChange={(e) => set('company_name', e.target.value)} />
        </label>
        <label>
          <span>사업자번호</span>
          <input value={form.biz_no} onChange={(e) => set('biz_no', e.target.value)} />
        </label>
        <label>
          <span>대표자</span>
          <input value={form.ceo_name} onChange={(e) => set('ceo_name', e.target.value)} />
        </label>
        <label>
          <span>업태</span>
          <input value={form.business_type} onChange={(e) => set('business_type', e.target.value)} />
        </label>
        <label>
          <span>종목</span>
          <input value={form.business_item} onChange={(e) => set('business_item', e.target.value)} />
        </label>
        <label>
          <span>전화</span>
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </label>
        <label>
          <span>담당자</span>
          <input value={form.manager_name} onChange={(e) => set('manager_name', e.target.value)} />
        </label>
        <label>
          <span>담당 휴대폰</span>
          <input value={form.manager_mobile} onChange={(e) => set('manager_mobile', e.target.value)} />
        </label>
        <label className="erp-form-grid__wide">
          <span>주소</span>
          <input value={form.address} onChange={(e) => set('address', e.target.value)} />
        </label>
        <label>
          <span>기초잔액</span>
          <input
            type="number"
            value={form.base_balance || ''}
            onChange={(e) => set('base_balance', Number(e.target.value))}
          />
        </label>
        <label>
          <span>세금계산서</span>
          <select value={form.tax_invoice_yn} onChange={(e) => set('tax_invoice_yn', e.target.value)}>
            <option value="Y">발행</option>
            <option value="N">미발행</option>
          </select>
        </label>
      </div>

      {error && <div className="erp-form-error">{error}</div>}
    </div>
  )
}
