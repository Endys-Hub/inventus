import { useEffect, useState } from "react";
import { getSupplier, updateSupplier } from "../../services/suppliers";
import { useNavigate, useParams } from "react-router-dom";

export default function EditSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    getSupplier(id).then((res) => setForm(res.data));
  }, [id]);

  if (!form) return <p className="p-4">Loading...</p>;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSupplier(id, form);
    navigate("/suppliers");
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Edit Supplier</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="name" value={form.name || ""} onChange={handleChange}
          placeholder="Supplier Name" required className="border p-2 w-full" />

        <input name="phone" value={form.phone || ""} onChange={handleChange}
          placeholder="Phone" className="border p-2 w-full" />

        <input name="email" type="email" value={form.email || ""} onChange={handleChange}
          placeholder="Email" className="border p-2 w-full" />

        <input name="address" value={form.address || ""} onChange={handleChange}
          placeholder="Address" className="border p-2 w-full" />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Update
        </button>
      </form>
    </div>
  );
}
