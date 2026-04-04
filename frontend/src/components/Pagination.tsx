interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/20">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
      >
        Previous
      </button>
      <div className="flex gap-2">
        {getPages().map((p, i) =>
          typeof p === 'string' ? (
            <span key={i} className="flex items-center px-2 text-slate-400">...</span>
          ) : (
            <button
              key={i}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                p === page
                  ? 'bg-primary text-white shadow-md'
                  : 'hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 text-xs font-bold text-primary hover:text-on-primary-container transition-colors disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
