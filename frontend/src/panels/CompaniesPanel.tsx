import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import DataGrid, { type Column } from '../components/erp/DataGrid'
import { api, type Company } from '../lib/api'
import { won } from '../lib/format'
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
  /** 외부에서 수정으로 진입할 때 */
  editId?: number
  /** true면 진입 시 신규 입력 모드 */
  startNew?: boolean
}

export default function CompaniesPanel({ editId, startNew }: Props) {
  const nameRef = useRef<HTMLInputElement>(null)

  const [rows, setRows] = useState<Company[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(editId ?? null)
  const [filter, setFilter] = useState('')
  const [listLoading, setListLoading] = useState(true)

  const [editingId, setEditingId] = useState<number | null>(editId ?? null)
  const [form, setForm] = useState(empty)
  const [companyCode, setCompanyCode] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isEdit = editingId != null

  const set = (key: keyof typeof empty, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }))

  const focusName = () => {
    requestAnimationFrame(() => nameRef.current?.focus())
  }

  const loadList = useCallback((q = filter) => {
    setListLoading(true)
    api
      .companies(q)
      .then(setRows)
      .finally(() => setListLoading(false))
  }, [filter])

  useEffect(() => {
    const t = setTimeout(() => loadList(filter), 200)
    return () => clearTimeout(t)
  }, [filter, loadList])

  const fillFromCompany = (c: Company) => {
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
  }

  const startCreate = useCallback(() => {
    setEditingId(null)
    setSelectedId(null)
    setForm(empty)
    setCompanyCode('')
    setError('')
    setNotice('')
    focusName()
  }, [])

  const loadForEdit = useCallback((id: number) => {
    setEditingId(id)
    setSelectedId(id)
    setFormLoading(true)
    setError('')
    setNotice('')
    api
      .getCompany(id)
      .then((c) => {
        fillFromCompany(c)
        focusName()
      })
      .catch((e) => setError(e instanceof Error ? e.message : '불러오기 실패'))
      .finally(() => setFormLoading(false))
  }, [])

  useEffect(() => {
    if (editId) {
      loadForEdit(editId)
    } else if (startNew) {
      startCreate()
    } else {
      startCreate()
    }
  }, [editId, startNew, loadForEdit, startCreate])

  const resetForm = () => {
    if (isEdit && editingId) {
      loadForEdit(editingId)
    } else {
      startCreate()
    }
  }

  const persist = async (continueCreate: boolean) => {
    setError('')
    setNotice('')
    if (!form.company_name.trim()) {
      setError('거래처명을 입력하세요.')
      focusName()
      return
    }
    setSaving(true)
    try {
      const body = {
        ...form,
        company_name: form.company_name.trim(),
        base_balance: Number(form.base_balance) || 0,
      }
      if (isEdit && editingId) {
        await api.updateCompany(editingId, body)
        setNotice('수정 저장됨')
        loadList()
        loadForEdit(editingId)
      } else {
        const created = await api.createCompany(body)
        loadList()
        if (continueCreate) {
          setCompanyCode(created.company_code)
          setForm(empty)
          setNotice(`${created.company_name} 저장됨 (${created.company_code})`)
          focusName()
        } else {
          setNotice(`${created.company_name} 저장됨`)
          loadForEdit(created.id)
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'F2' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      void persist(false)
    }
  }

  const columns: Column<Company>[] = [
    { key: 'company_code', title: '코드', width: 72 },
    { key: 'company_name', title: '거래처명', width: 120 },
    { key: 'ceo_name', title: '대표', width: 64, render: (r) => r.ceo_name || '' },
    { key: 'phone', title: '전화', width: 96, render: (r) => r.phone || '' },
    {
      key: 'base_balance',
      title: '기초잔액',
      width: 88,
      align: 'right',
      render: (r) => won(r.base_balance),
    },
  ]

  const totalBase = useMemo(
    () => rows.reduce((a, r) => a + (r.base_balance || 0), 0),
    [rows],
  )

  return (
    <div className="erp-panel erp-panel--split" onKeyDown={onKeyDown}>
      <div className="erp-split">
        <section className="erp-split__list">
          <div className="erp-toolbar">
            <span className="erp-toolbar__title">거래처</span>
            <div className="erp-toolbar__actions">
              <button type="button" className="erp-btn" onClick={() => loadList()} disabled={listLoading}>
                조회
              </button>
              <button type="button" className="erp-btn erp-btn--primary" onClick={startCreate}>
                신규
              </button>
            </div>
            <div className="erp-toolbar__filter">
              <label>
                검색
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="거래처명"
                />
              </label>
            </div>
          </div>

          <DataGrid
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            selectedKey={selectedId}
            onSelect={(row) => loadForEdit(row.id)}
            onDoubleClick={(row) => loadForEdit(row.id)}
            emptyText={listLoading ? '불러오는 중…' : '등록된 거래처가 없습니다.'}
            footer={
              <span>
                {rows.length}건 · 기초잔액 <strong>{won(totalBase)}</strong>
              </span>
            }
          />
        </section>

        <section className="erp-split__form">
          <div className="erp-toolbar">
            <span className="erp-toolbar__title">{isEdit ? '거래처수정' : '거래처등록'}</span>
            <div className="erp-toolbar__actions">
              <button
                type="button"
                className="erp-btn erp-btn--primary"
                disabled={saving || formLoading}
                onClick={() => persist(false)}
              >
                {isEdit ? '수정 저장' : '저장'}
              </button>
              {!isEdit && (
                <button
                  type="button"
                  className="erp-btn"
                  disabled={saving || formLoading}
                  onClick={() => persist(true)}
                >
                  저장 후 계속
                </button>
              )}
              <button type="button" className="erp-btn" disabled={formLoading} onClick={resetForm}>
                {isEdit ? '되돌리기' : '초기화'}
              </button>
            </div>
          </div>

          {formLoading ? (
            <div className="erp-form-grid erp-form-grid--compact">
              <p>불러오는 중…</p>
            </div>
          ) : (
            <div className="erp-form-grid erp-form-grid--compact">
              <label>
                <span>거래처코드</span>
                <input
                  value={companyCode}
                  readOnly
                  placeholder={isEdit ? '' : '저장 시 자동 생성'}
                />
              </label>
              <label className="erp-form-grid__half">
                <span>거래처명 *</span>
                <input
                  ref={nameRef}
                  value={form.company_name}
                  onChange={(e) => set('company_name', e.target.value)}
                />
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

          <div className="erp-form-hint">목록 클릭=수정 · 신규=등록 · Ctrl+F2 저장</div>
          {notice && <div className="erp-form-hint">{notice}</div>}
          {error && <div className="erp-form-error">{error}</div>}
        </section>
      </div>
    </div>
  )
}
