export function Pagination({ page, setPage, hasNext, hasPrev, totalCount, pageSize = 25 }) {
  if (totalCount === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = hasNext ? page * pageSize : totalCount;

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-sm text-gray-500">
        Showing {from}–{to} of {totalCount}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={!hasPrev}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          ← Prev
        </button>
        <span className="px-3 py-1.5 text-sm font-medium text-gray-700">
          {page}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNext}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
