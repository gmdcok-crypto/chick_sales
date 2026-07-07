import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

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

export default function CompanyNewPage() {
  const nav = useNavigate()
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
      nav('/companies')
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="sheet sheet--neutral">
      <header className="sheet__header">
        <button type="button" className="sheet__back" onClick={() => nav('/companies')}>
          ←
        </button>
        <h1>거래처 등록</h1>
      </header>

      <form
        className="form-sheet"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <section className="form-section">
          <h2>기본 정보</h2>
          <label className="field">
            <span>거래처명 *</span>
            <input
              value={form.company_name}
              onChange={(e) => set('company_name', e.target.value)}
              placeholder="상호"
              autoFocus
            />
          </label>
          <label className="field">
            <span>사업자번호</span>
            <input
              value={form.biz_no}
              onChange={(e) => set('biz_no', e.target.value)}
              placeholder="000-00-00000"
            />
          </label>
          <label className="field">
            <span>대표자</span>
            <input value={form.ceo_name} onChange={(e) => set('ceo_name', e.target.value)} />
          </label>
          <div className="field-row">
            <label className="field">
              <span>업태</span>
              <input
                value={form.business_type}
                onChange={(e) => set('business_type', e.target.value)}
              />
            </label>
            <label className="field">
              <span>종목</span>
              <input
                value={form.business_item}
                onChange={(e) => set('business_item', e.target.value)}
              />
            </label>
          </div>
          <label className="field">
            <span>주소</span>
            <input value={form.address} onChange={(e) => set('address', e.target.value)} />
          </label>
        </section>

        <section className="form-section">
          <h2>연락처</h2>
          <label className="field">
            <span>전화</span>
            <input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              inputMode="tel"
            />
          </label>
          <label className="field">
            <span>담당자</span>
            <input value={form.manager_name} onChange={(e) => set('manager_name', e.target.value)} />
          </label>
          <label className="field">
            <span>담당자 휴대폰</span>
            <input
              value={form.manager_mobile}
              onChange={(e) => set('manager_mobile', e.target.value)}
              inputMode="tel"
            />
          </label>
        </section>

        <section className="form-section">
          <h2>거래 설정</h2>
          <label className="field">
            <span>기초잔액</span>
            <input
              type="number"
              value={form.base_balance || ''}
              onChange={(e) => set('base_balance', Number(e.target.value))}
              placeholder="0"
            />
          </label>
          <label className="field">
            <span>세금계산서</span>
            <select
              value={form.tax_invoice_yn}
              onChange={(e) => set('tax_invoice_yn', e.target.value)}
            >
              <option value="Y">발행</option>
              <option value="N">미발행</option>
            </select>
          </label>
        </section>

        {error && <p className="sheet__error">{error}</p>}

        <footer className="sheet__footer sheet__footer--form">
          <button type="submit" className="btn btn--primary btn--neutral" disabled={saving}>
            {saving ? '저장 중…' : '거래처 저장'}
          </button>
        </footer>
      </form>
    </div>
  )
}
