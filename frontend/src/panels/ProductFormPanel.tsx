import { useState } from 'react'
import { api } from '../lib/api'
import { useTabs } from '../context/TabContext'

const ORIGINS = ['', '국내산', '미국산', '브라질산', '기타']
const COLD_TYPES = ['', '냉장', '냉동', '실온']

const empty = {
  product_name: '',
  product_report_no: '',
  spec: '',
  origin: '',
  pouch_content: '',
  cold_type: '',
  tax_type: '면세',
}

export default function ProductFormPanel() {
  const { openTab } = useTabs()
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof empty, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const save = async () => {
    setError('')
    if (!form.product_name.trim()) {
      setError('품목명을 입력하세요.')
      return
    }
    setSaving(true)
    try {
      await api.createProduct({
        ...form,
        product_name: form.product_name.trim(),
      })
      setForm(empty)
      openTab('products')
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  const saveAndContinue = async () => {
    setError('')
    if (!form.product_name.trim()) {
      setError('품목명을 입력하세요.')
      return
    }
    setSaving(true)
    try {
      await api.createProduct({
        ...form,
        product_name: form.product_name.trim(),
      })
      setForm({ ...empty, tax_type: form.tax_type, cold_type: form.cold_type, origin: form.origin })
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="erp-panel erp-panel--form">
      <div className="erp-toolbar">
        <span className="erp-toolbar__title">품목등록</span>
        <div className="erp-toolbar__actions">
          <button type="button" className="erp-btn erp-btn--primary" disabled={saving} onClick={save}>
            저장
          </button>
          <button type="button" className="erp-btn" disabled={saving} onClick={saveAndContinue}>
            저장 후 계속
          </button>
          <button type="button" className="erp-btn" onClick={() => setForm(empty)}>
            초기화
          </button>
        </div>
      </div>

      <div className="erp-form-grid">
        <label>
          <span>품목명 *</span>
          <input
            value={form.product_name}
            onChange={(e) => set('product_name', e.target.value)}
            autoFocus
          />
        </label>
        <label>
          <span>규격</span>
          <input value={form.spec} onChange={(e) => set('spec', e.target.value)} placeholder="kg, g 등" />
        </label>
        <label>
          <span>과세구분</span>
          <select value={form.tax_type} onChange={(e) => set('tax_type', e.target.value)}>
            <option value="면세">면세</option>
            <option value="과세">과세</option>
          </select>
        </label>
        <label>
          <span>원산지</span>
          <select value={form.origin} onChange={(e) => set('origin', e.target.value)}>
            {ORIGINS.map((o) => (
              <option key={o || 'none'} value={o}>
                {o || '—'}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>보관</span>
          <select value={form.cold_type} onChange={(e) => set('cold_type', e.target.value)}>
            {COLD_TYPES.map((c) => (
              <option key={c || 'none'} value={c}>
                {c || '—'}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>품목제조보고번호</span>
          <input
            value={form.product_report_no}
            onChange={(e) => set('product_report_no', e.target.value)}
          />
        </label>
        <label className="erp-form-grid__wide">
          <span>파우치 내용</span>
          <input value={form.pouch_content} onChange={(e) => set('pouch_content', e.target.value)} />
        </label>
      </div>

      {error && <div className="erp-form-error">{error}</div>}
    </div>
  )
}
