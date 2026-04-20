import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { useList } from "../../hooks/useList";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { Pagination } from "../../components/ui/Pagination";
import { ErrorMessage } from "../../components/ui/ErrorMessage";

const CATEGORIES = [
  { value: "rent", label: "Rent" },
  { value: "salary", label: "Salary" },
  { value: "utilities", label: "Utilities" },
  { value: "fuel", label: "Fuel" },
  { value: "stock", label: "Stock Purchase" },
  { value: "transport", label: "Transport" },
  { value: "misc", label: "Miscellaneous" },
];

export default function ExpensesList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filterDate, setFilterDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const {
    items: expenses,
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
  } = useList("expenses", "/expenses/", { date: filterDate, category: filterCategory });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}/`);
      qc.invalidateQueries({ queryKey: ["expenses"] });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete expense.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Expenses</h2>
          <div className="flex items-center gap-3">
            {isFetching && !isLoading && (
              <span className="text-sm text-gray-400">Refreshing…</span>
            )}
            <Link to="/expenses/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              + Add Expense
            </Link>
          </div>
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
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {(filterDate || filterCategory) && (
            <button
              onClick={() => { setFilterDate(""); setFilterCategory(""); }}
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
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton rows={6} cols={5} />
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">No expenses found.</td>
                </tr>
              ) : (
                expenses.map((ex) => (
                  <tr key={ex.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{ex.date}</td>
                    <td className="p-3 capitalize">{ex.category}</td>
                    <td className="p-3 text-right font-medium">₦{Number(ex.amount).toFixed(2)}</td>
                    <td className="p-3 text-gray-600">{ex.description || "—"}</td>
                    <td className="p-3 space-x-3">
                      <button
                        onClick={() => navigate(`/expenses/edit/${ex.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(ex.id)} className="text-red-600 hover:underline">
                        Delete
                      </button>
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
