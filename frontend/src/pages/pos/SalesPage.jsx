import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function SalesPage() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    try {
      const res = await api.get("/sales/");
      setSales(res.data);
    } catch (err) {
      console.error("Failed loading sales:", err);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Sales History</h2>

      {sales.map((sale) => (
        <div key={sale.id} className="border rounded p-4 mb-4">
          <p className="font-bold">Sale #{sale.id}</p>
          <p>Total: ₦{sale.total_amount}</p>
          <p>Date: {new Date(sale.created_at).toLocaleString()}</p>

          <h4 className="font-semibold mt-2">Items:</h4>
          {sale.items.map((item) => (
            <p key={item.id}>
              {item.product_name} × {item.quantity} — ₦{item.subtotal}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
