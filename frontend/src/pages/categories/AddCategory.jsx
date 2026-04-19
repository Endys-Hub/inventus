import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

export default function AddCategory() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/inventory/categories/", { name });
    navigate("/categories");
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-xl mx-auto">

        <h1 className="text-2xl font-bold mb-4">Add Category</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Category Name"
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </form>

      </div>
    </>
  );
}

