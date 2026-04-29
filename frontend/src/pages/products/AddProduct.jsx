import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

export default function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
  });

  const fetchCategories = async () => {
    try {
      const res = await api.get("/inventory/categories/");
      const data = res.data;
      setCategories(Array.isArray(data) ? data : (data?.results ?? []));
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (!form.category) {
      alert("Please select a category.");
      return;
    }

    if (!categories.some((c) => c.id === Number(form.category))) {
      alert("Invalid category selected. Please refresh and select again.");
      return;
    }

    const payload = {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      category: Number(form.category),
    };
    console.log("Payload:", payload);

    setSaving(true);
    try {
      await api.post("/inventory/products/", payload);
      navigate("/products");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const noCategoriesAvailable = !loadingCategories && categories.length === 0;
  const submitDisabled = loadingCategories || categories.length === 0 || saving;

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Add Product</h1>

        {noCategoriesAvailable && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">
            No categories available. Please{" "}
            <a href="/categories/add" className="underline font-medium">create a category</a>{" "}
            first.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            placeholder="Product name"
            className="border p-2 w-full"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            placeholder="Price"
            className="border p-2 w-full"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />

          <input
            placeholder="Stock"
            className="border p-2 w-full"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
          />

          <select
            className="border p-2 w-full"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            disabled={loadingCategories || noCategoriesAvailable}
          >
            <option value="">
              {loadingCategories ? "Loading categories..." : "Select category"}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={submitDisabled}
            className={`px-4 py-2 rounded text-white ${
              submitDisabled
                ? "bg-blue-300 cursor-not-allowed opacity-50"
                : "bg-blue-700 hover:bg-blue-800"
            }`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </>
  );
}
