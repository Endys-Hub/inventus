export function ErrorMessage({ error, onRetry }) {
  const msg =
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load data. Please try again.";

  return (
    <div className="flex items-center gap-4 p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm">
      <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span className="text-red-700 flex-1">{msg}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-600 font-semibold hover:underline whitespace-nowrap"
        >
          Try again
        </button>
      )}
    </div>
  );
}
