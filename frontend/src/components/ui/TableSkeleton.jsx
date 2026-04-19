export function TableSkeleton({ rows = 6, cols = 4 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }, (_, j) => (
            <td key={j} className="p-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${60 + ((i + j) % 3) * 15}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
