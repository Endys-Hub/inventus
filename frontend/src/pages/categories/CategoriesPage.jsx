import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { useList } from "../../hooks/useList";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { Pagination } from "../../components/ui/Pagination";
import { ErrorMessage } from "../../components/ui/ErrorMessage";

export default function CategoriesPage() {
  const qc = useQueryClient();
  const {
    items: categories,
    isLoading,
    isError,
    error,
    refetch,
    page,
    setPage,
    totalCount,
    hasNext,
    hasPrev,
  } = useList("categories", "/inventory/categories/");

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/inventory/categories/${id}/`);
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete category.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Categories</h1>
          <Link to="/categories/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Add Category
          </Link>
        </div>

        {isError && <ErrorMessage error={error} onRetry={refetch} />}

        <div className="overflow-x-auto bg-white shadow rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton rows={5} cols={2} />
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-gray-400">No categories yet.</td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3 space-x-3">
                      <Link to={`/categories/edit/${c.id}`} className="text-blue-600 hover:underline">Edit</Link>
                      <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Delete</button>
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
