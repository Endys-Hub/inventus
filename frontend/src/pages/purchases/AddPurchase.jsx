import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function AddPurchase() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [supplier, setSupplier] = useState("");
  const [purchaseItems, setPurchaseItems] = useState([
    { product: "", quantity: 1, cost_price: 0 },
  ]);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Fetch suppliers and products
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await api.get("/inventory/suppliers/");
        setSuppliers(res.data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await api.get("/inventory/products/");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchSuppliers();
    fetchProducts();
  }, []);

  // Handle purchase item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...purchaseItems];
    updatedItems[index][field] = value;
    setPurchaseItems(updatedItems);
  };

  const addItemRow = () => {
    setPurchaseItems([...purchaseItems, { product: "", quantity: 1, cost_price: 0 }]);
  };

  const removeItemRow = (index) => {
    const updatedItems = purchaseItems.filter((_, i) => i !== index);
    setPurchaseItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!supplier) {
      alert("Please select a supplier.");
      return;
    }

    if (purchaseItems.length === 0) {
      alert("Please add at least one purchase item.");
      return;
    }

    const payload = {
      supplier,
      date,
      notes,
      items: purchaseItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        cost_price: parseFloat(item.cost_price),
      })),
    };

    try {
      await api.post("/inventory/purchases/", payload);
      alert("Purchase added successfully!");
      navigate("/purchases");
    } catch (err) {
      console.error("Error adding purchase:", err);
      alert("Failed to add purchase.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Add New Purchase</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">

        {/* Supplier */}
        <div>
          <label className="block font-semibold mb-1">Supplier</label>
          <select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">-- Select Supplier --</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Purchase Items */}
        <div>
          <label className="block font-semibold mb-1">Purchase Items</label>
          {purchaseItems.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-2 mb-2 items-end"
            >
              <select
                value={item.product}
                onChange={(e) => handleItemChange(index, "product", e.target.value)}
                className="border p-2 rounded col-span-2"
                required
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                className="border p-2 rounded"
                placeholder="Qty"
                required
              />

              <input
                type="number"
                min="0"
                step="0.01"
                value={item.cost_price}
                onChange={(e) => handleItemChange(index, "cost_price", e.target.value)}
                className="border p-2 rounded"
                placeholder="Cost"
                required
              />

              <button
                type="button"
                onClick={() => removeItemRow(index)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addItemRow}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
          >
            Add Item
          </button>
        </div>

        {/* Date */}
        <div>
          <label className="block font-semibold mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block font-semibold mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Optional notes..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save Purchase
        </button>
      </form>
    </div>
  );
}
