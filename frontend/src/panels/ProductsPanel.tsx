import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import DataGrid, { type Column } from '../components/erp/DataGrid'
import { api, type Product } from '../lib/api'

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

type Props = {
  editId?: number
}

export default function ProductsPanel({ editId }: Props) {
  const nameRef = useRef<HTMLInputElement>(null)

  const [rows, setRows] = useState<Product[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(editId ?? null)
  const [filter, setFilter] = useState('')
  const [listLoading, setListLoading] = useState(true)

  const [editingId, setEditingId] = useState<number | null>(editId ?? null)
  const [form, setForm] = useState(empty)
  const [productCode, setProductCode] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isEdit = editingId != null

  const set = (key: keyof typeof empty, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const focusName = () => {
    requestAnimationFrame(() => nameRef.current?.focus())
  }

  const loadList = useCallback(
    (q = filter) => {
      setListLoading(true)
      api
        .products(q)
        .then(setRows)
        .finally(() => setListLoading(false))
    },
    [filter],
  )

  useEffect(() => {
    const t = setTimeout(() => loadList(filter), 200)
    return () => clearTimeout(t)
  }, [filter, loadList])

  const fillFromProduct = (p: Product) => {
    setProductCode(p.product_code)
    setForm({
      product_name: p.product_name || '',
      product_report_no: p.product_report_no || '',
      spec: p.spec || '',
      origin: p.origin || '',
      pouch_content: p.pouch_content || '',
      cold_type: p.cold_type || '',
      tax_type: p.tax_type || '면세',
    })
  }

  const startCreate = useCallback(() => {
    setEditingId(null)
    setSelectedId(null)
    setForm(empty)
    setProductCode('')
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
      .getProduct(id)
      .then((p) => {
        fillFromProduct(p)
        focusName()
      })
      .catch((e) => setError(e instanceof Error ? e.message : '불러오기 실패'))
      .finally(() => setFormLoading(false))
  }, [])

  useEffect(() => {
    if (editId) loadForEdit(editId)
    else startCreate()
  }, [editId, loadForEdit, startCreate])

  const resetForm = () => {
    if (isEdit && editingId) loadForEdit(editingId)
    else startCreate()
  }

  const persist = async (continueCreate: boolean) => {
    setError('')
    setNotice('')
    if (!form.product_name.trim()) {
      setError('품목명을 입력하세요.')
      focusName()
      return
    }
    setSaving(true)
    try {
      const body = {
        ...form,
        product_name: form.product_name.trim(),
      }
      if (isEdit && editingId) {
        await api.updateProduct(editingId, body)
        setNotice('수정 저장됨')
        loadList()
        loadForEdit(editingId)
      } else {
        const created = await api.createProduct(body)
        loadList()
        if (continueCreate) {
          setProductCode(created.product_code)
          setForm({
            ...empty,
            tax_type: form.tax_type,
            cold_type: form.cold_type,
            origin: form.origin,
          })
          setNotice(`${created.product_name} 저장됨 (${created.product_code})`)
          focusName()
        } else {
          setNotice(`${created.product_name} 저장됨`)
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

  const columns: Column<Product>[] = [
    { key: 'product_code', title: '코드', width: 80 },
    { key: 'product_name', title: '품목명', width: 120 },
    { key: 'spec', title: '규격', width: 64 },
    { key: 'tax_type', title: '과세', width: 48, align: 'center' },
    { key: 'origin', title: '원산지', width: 64, render: (r) => r.origin || '' },
    {
      key: 'cold_type',
      title: '보관',
      width: 48,
      align: 'center',
      render: (r) => r.cold_type || '',
    },
  ]

  return (
    <div className="erp-panel erp-panel--split" onKeyDown={onKeyDown}>
      <div className="erp-split">
        <section className="erp-split__list">
          <div className="erp-toolbar">
            <span className="erp-toolbar__title">품목</span>
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
                  placeholder="품목명·코드·규격"
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
            emptyText={listLoading ? '불러오는 중…' : '등록된 품목이 없습니다.'}
            footer={<span>{rows.length}건</span>}
          />
        </section>

        <section className="erp-split__form">
          <div className="erp-toolbar">
            <span className="erp-toolbar__title">{isEdit ? '품목수정' : '품목등록'}</span>
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
                <span>품목코드</span>
                <input value={productCode} readOnly placeholder={isEdit ? '' : '저장 시 자동 생성'} />
              </label>
              <label className="erp-form-grid__half">
                <span>품목명 *</span>
                <input
                  ref={nameRef}
                  value={form.product_name}
                  onChange={(e) => set('product_name', e.target.value)}
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
              <label className="erp-form-grid__half">
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
          )}

          <div className="erp-form-hint">
            목록 클릭=수정 · 신규=등록 · 저장 후 계속(과세·원산지·보관 유지) · Ctrl+F2 저장
          </div>
          {notice && <div className="erp-form-hint">{notice}</div>}
          {error && <div className="erp-form-error">{error}</div>}
        </section>
      </div>
    </div>
  )
}
