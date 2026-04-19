import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

export default function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");

  const fetchCategory = async () => {
    const res = await api.get(`/inventory/categories/${id}/`);
    setName(res.data.name);
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.put(`/inventory/categories/${id}/`, { name });
    navigate("/categories");
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-xl mx-auto">

        <h1 className="text-2xl font-bold mb-4">Edit Category</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Category Name"
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Update
          </button>
        </form>

      </div>
    </>
  );
}

