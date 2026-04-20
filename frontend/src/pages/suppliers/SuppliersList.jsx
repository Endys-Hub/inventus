import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { useList } from "../../hooks/useList";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { Pagination } from "../../components/ui/Pagination";
import { ErrorMessage } from "../../components/ui/ErrorMessage";

export default function SuppliersList() {
  const qc = useQueryClient();
  const {
    items: suppliers,
    isLoading,
    isError,
    error,
    refetch,
    page,
    setPage,
    totalCount,
    hasNext,
    hasPrev,
  } = useList("suppliers", "/inventory/suppliers/");

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    try {
      await api.delete(`/inventory/suppliers/${id}/`);
      qc.invalidateQueries({ queryKey: ["suppliers"] });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete supplier.");
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Link to="/suppliers/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Supplier
        </Link>
      </div>

      {isError && <ErrorMessage error={error} onRetry={refetch} />}

      <div className="overflow-x-auto bg-white shadow rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton rows={5} cols={4} />
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">No suppliers yet.</td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 text-gray-600">{s.email ?? "—"}</td>
                  <td className="p-3 text-gray-600">{s.phone ?? "—"}</td>
                  <td className="p-3 space-x-3">
                    <Link to={`/suppliers/edit/${s.id}`} className="text-blue-600 hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">Delete</button>
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
  );
}
