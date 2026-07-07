import type { ReactNode } from 'react'

export type Column<T> = {
  key: string
  title: string
  width?: number | string
  align?: 'left' | 'right' | 'center'
  render?: (row: T, index: number) => ReactNode
}

type Props<T> = {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  selectedKey?: string | number | null
  onSelect?: (row: T) => void
  onDoubleClick?: (row: T) => void
  emptyText?: string
  footer?: ReactNode
}

export default function DataGrid<T>({
  columns,
  rows,
  rowKey,
  selectedKey,
  onSelect,
  onDoubleClick,
  emptyText = '데이터 없음',
  footer,
}: Props<T>) {
  return (
    <div className="dg-wrap">
      <div className="dg-scroll">
        <table className="dg">
          <thead>
            <tr>
              <th className="dg__no">No</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width, textAlign: col.align || 'left' }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="dg__empty">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const key = rowKey(row)
                const selected = selectedKey != null && selectedKey === key
                return (
                  <tr
                    key={key}
                    className={selected ? 'dg__row--selected' : undefined}
                    onClick={() => onSelect?.(row)}
                    onDoubleClick={() => onDoubleClick?.(row)}
                  >
                    <td className="dg__no">{index + 1}</td>
                    {columns.map((col) => (
                      <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                        {col.render ? col.render(row, index) : (row as Record<string, unknown>)[col.key] as ReactNode}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {footer && <div className="dg-footer">{footer}</div>}
    </div>
  )
}
