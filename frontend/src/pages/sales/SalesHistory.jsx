import { useState } from "react";
import Navbar from "../../components/Navbar";
import SaleDetailModal from "./SaleDetailModal";
import { useList } from "../../hooks/useList";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { Pagination } from "../../components/ui/Pagination";
import { ErrorMessage } from "../../components/ui/ErrorMessage";

export default function SalesHistory() {
  const [filterDate, setFilterDate] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);

  const {
    items: sales,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    page,
    setPage,
    totalCount,
    hasNext,
    hasPrev,
  } = useList("sales", "/sales/", { date: filterDate, payment_method: filterMethod });

  return (
    <>
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Sales History</h2>
          {isFetching && !isLoading && (
            <span className="text-sm text-gray-400">Refreshing…</span>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="pos">POS (Card)</option>
            <option value="transfer">Mobile Transfer</option>
          </select>
          {(filterDate || filterMethod) && (
            <button
              onClick={() => { setFilterDate(""); setFilterMethod(""); }}
              className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear filters
            </button>
          )}
        </div>

        {isError && <ErrorMessage error={error} onRetry={refetch} />}

        <div className="overflow-x-auto bg-white shadow rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton rows={6} cols={4} />
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">No sales found.</td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedSale(sale)}
                  >
                    <td className="p-3 text-gray-500">#{sale.id}</td>
                    <td className="p-3">{new Date(sale.created_at).toLocaleString()}</td>
                    <td className="p-3 font-medium">₦{Number(sale.total_amount).toFixed(2)}</td>
                    <td className="p-3 capitalize">{sale.payment_method || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          setPage={setPage}
          hasNext={hasNext}
          hasPrev={hasPrev}
          totalCount={totalCount}
        />

        {selectedSale && (
          <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
        )}
      </div>
    </>
  );
}
