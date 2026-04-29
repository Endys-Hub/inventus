import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { useList } from "../../hooks/useList";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { Pagination } from "../../components/ui/Pagination";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import Navbar from "../../components/Navbar";

export default function PurchasesPage() {
  const qc = useQueryClient();
  const {
    items: purchases,
    isLoading,
    isError,
    error,
    refetch,
    page,
    setPage,
    totalCount,
    hasNext,
    hasPrev,
  } = useList("purchases", "/inventory/purchases/");

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this purchase?")) return;
    try {
      await api.delete(`/inventory/purchases/${id}/`);
      qc.invalidateQueries({ queryKey: ["purchases"] });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete purchase.");
    }
  };

  return (
    <>
    <Navbar />
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Purchases</h1>
        <Link to="/purchases/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Purchase
        </Link>
      </div>

      {isError && <ErrorMessage error={error} onRetry={refetch} />}

      <div className="overflow-x-auto bg-white rounded shadow overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Supplier</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Total Cost</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : purchases.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">No purchases yet.</td>
              </tr>
            ) : (
              purchases.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-500">#{p.id}</td>
                  <td className="p-3 font-medium">{p.supplier_detail?.name ?? "—"}</td>
                  <td className="p-3 text-gray-600">{p.date}</td>
                  <td className="p-3">₦{Number(p.total_amount).toFixed(2)}</td>
                  <td className="p-3 space-x-3">
                    <Link to={`/purchases/edit/${p.id}`} className="text-blue-600 hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
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
    </div>
    </>
  );
}
