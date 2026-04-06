interface Column<T> {
  key: keyof T
  label: string
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface DataTableProps<T extends { id: string }> {
  data: T[]
  columns: Column<T>[]
  onEdit: (row: T) => void
  onDelete: (id: string) => void
}

export function DataTable<T extends { id: string }>({ data, columns, onEdit, onDelete }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-dark-border">
      <table className="w-full text-sm">
        <thead className="bg-dark-card border-b border-dark-border">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="text-left px-4 py-3 text-gray-400 font-medium">{col.label}</th>
            ))}
            <th className="text-right px-4 py-3 text-gray-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-dark-border hover:bg-white/2 transition-colors">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-gray-300">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                </td>
              ))}
              <td className="px-4 py-3 text-right flex gap-2 justify-end">
                <button onClick={() => onEdit(row)} className="text-cyan hover:text-cyan-dark text-xs font-medium transition-colors">Edit</button>
                <button onClick={() => onDelete(row.id)} className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">No entries yet.</div>
      )}
    </div>
  )
}
