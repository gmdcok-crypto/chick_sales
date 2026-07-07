import { useEffect, useState } from 'react'
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

type Props = {
  companyId?: number
}

export default function CompanyFormPanel({ companyId }: Props) {
  const { openTab } = useTabs()
  const isEdit = companyId != null
  const [form, setForm] = useState(empty)
  const [companyCode, setCompanyCode] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof empty, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }))

  useEffect(() => {
    if (!companyId) {
      setForm(empty)
      setCompanyCode('')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    api
      .getCompany(companyId)
      .then((c) => {
        setCompanyCode(c.company_code)
        setForm({
          company_name: c.company_name || '',
          biz_no: c.biz_no || '',
          ceo_name: c.ceo_name || '',
          business_type: c.business_type || '',
          business_item: c.business_item || '',
          address: c.address || '',
          phone: c.phone || '',
          manager_name: c.manager_name || '',
          manager_mobile: c.manager_mobile || '',
          base_balance: c.base_balance || 0,
          tax_invoice_yn: c.tax_invoice_yn || 'Y',
        })
      })
      .catch((e) => setError(e instanceof Error ? e.message : '불러오기 실패'))
      .finally(() => setLoading(false))
  }, [companyId])

  const reset = () => {
    if (isEdit && companyId) {
      setLoading(true)
      api
        .getCompany(companyId)
        .then((c) => {
          setForm({
            company_name: c.company_name || '',
            biz_no: c.biz_no || '',
            ceo_name: c.ceo_name || '',
            business_type: c.business_type || '',
            business_item: c.business_item || '',
            address: c.address || '',
            phone: c.phone || '',
            manager_name: c.manager_name || '',
            manager_mobile: c.manager_mobile || '',
            base_balance: c.base_balance || 0,
            tax_invoice_yn: c.tax_invoice_yn || 'Y',
          })
          setError('')
        })
        .finally(() => setLoading(false))
    } else {
      setForm(empty)
      setError('')
    }
  }

  const save = async () => {
    setError('')
    if (!form.company_name.trim()) {
      setError('거래처명을 입력하세요.')
      return
    }
    setSaving(true)
    try {
      const body = {
        ...form,
        company_name: form.company_name.trim(),
        base_balance: Number(form.base_balance) || 0,
      }
      if (isEdit && companyId) {
        await api.updateCompany(companyId, body)
      } else {
        await api.createCompany(body)
        setForm(empty)
      }
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
        <span className="erp-toolbar__title">{isEdit ? '거래처수정' : '거래처등록'}</span>
        <div className="erp-toolbar__actions">
          <button
            type="button"
            className="erp-btn erp-btn--primary"
            disabled={saving || loading}
            onClick={save}
          >
            {isEdit ? '수정 저장' : '저장'}
          </button>
          <button type="button" className="erp-btn" disabled={loading} onClick={reset}>
            {isEdit ? '되돌리기' : '초기화'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="erp-form-grid">
          <p>불러오는 중…</p>
        </div>
      ) : (
        <div className="erp-form-grid">
          {isEdit && (
            <label>
              <span>거래처코드</span>
              <input value={companyCode} readOnly />
            </label>
          )}
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
      )}

      {error && <div className="erp-form-error">{error}</div>}
    </div>
  )
}
