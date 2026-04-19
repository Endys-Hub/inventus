import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
  });

  const fetchProduct = async () => {
    const res = await api.get(`/inventory/products/${id}/`);
    setForm(res.data);
  };

  const fetchCategories = async () => {
    const res = await api.get("/inventory/categories/");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.put(`/inventory/products/${id}/`, form);
    navigate("/products");
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-xl mx-auto">

        <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

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
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Update
          </button>
        </form>
      </div>
    </>
  );
}

