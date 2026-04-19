import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("rent");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const CATEGORIES = [
    { value: "rent", label: "Rent" },
    { value: "salary", label: "Salary" },
    { value: "utilities", label: "Utilities" },
    { value: "fuel", label: "Fuel" },
    { value: "stock", label: "Stock Purchase" },
    { value: "transport", label: "Transport" },
    { value: "misc", label: "Miscellaneous" },
  ];

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await api.get(`/expenses/${id}/`);
        const e = res.data;
        setCategory(e.category);
        setAmount(e.amount);
        setDescription(e.description);
        setDate(e.date);
      } catch (err) {
        console.error("Load expense error:", err);
        alert("Failed to load expense");
      }
      setLoading(false);
    };
    fetchExpense();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/expenses/${id}/`, { category, amount, description, date });
      alert("Expense updated");
      navigate("/expenses");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update expense");
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="p-6">Loading...</div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Expense</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 w-full rounded">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            className="border p-2 w-full rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <input
            type="date"
            className="border p-2 w-full rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <textarea
            placeholder="Description (optional)"
            className="border p-2 w-full rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Update
            </button>

            <button type="button" onClick={() => navigate("/expenses")} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
