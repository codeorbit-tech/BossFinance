export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="skeleton h-4 w-32" />
        <div className="flex gap-3">
          <div className="skeleton h-8 w-20 rounded-lg" />
          <div className="skeleton h-8 w-24 rounded-lg" />
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-surface-container-low/50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-6 py-4">
                <div className="skeleton h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-surface-container/50">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-6 py-5">
                  <div className={`skeleton h-4 ${c === 0 ? 'w-24' : 'w-16'}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl">
      <div className="skeleton h-3 w-24 mb-3" />
      <div className="skeleton h-7 w-32 mb-4" />
      <div className="skeleton h-3 w-20" />
    </div>
  );
}

export function EmptyState({ icon = 'inbox', title, description }: { icon?: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="material-symbols-outlined text-6xl text-surface-container-highest mb-4">{icon}</span>
      <h3 className="text-lg font-bold text-tertiary mb-2">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-md">{description}</p>
    </div>
  );
}
