import { useState } from "react";
import { createSupplier } from "../../services/suppliers";
import { useNavigate } from "react-router-dom";

export default function AddSupplier() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createSupplier(form);
    navigate("/suppliers");
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Supplier</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="name" placeholder="Supplier Name" value={form.name}
          onChange={handleChange} required className="border p-2 w-full" />

        <input name="phone" placeholder="Phone" value={form.phone}
          onChange={handleChange} className="border p-2 w-full" />

        <input name="email" type="email" placeholder="Email" value={form.email}
          onChange={handleChange} className="border p-2 w-full" />

        <input name="address" placeholder="Address" value={form.address}
          onChange={handleChange} className="border p-2 w-full" />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
}
