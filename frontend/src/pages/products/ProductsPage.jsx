import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { useList } from "../../hooks/useList";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { Pagination } from "../../components/ui/Pagination";
import { ErrorMessage } from "../../components/ui/ErrorMessage";

export default function ProductsPage() {
  const qc = useQueryClient();
  const {
    items: products,
    isLoading,
    isError,
    error,
    refetch,
    page,
    setPage,
    totalCount,
    hasNext,
    hasPrev,
  } = useList("products", "/inventory/products/");

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/inventory/products/${id}/`);
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete product.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Products</h1>
          <Link to="/products/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Add Product
          </Link>
        </div>

        {isError && <ErrorMessage error={error} onRetry={refetch} />}

        <div className="overflow-x-auto bg-white shadow rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton rows={6} cols={5} />
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">No products found.</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-gray-600">{p.category_detail?.name ?? "—"}</td>
                    <td className="p-3">₦{Number(p.price).toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`font-medium ${
                        p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : ""
                      }`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3 space-x-3">
                      <Link to={`/products/edit/${p.id}`} className="text-blue-500 hover:underline">Edit</Link>
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
