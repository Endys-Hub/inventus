import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function POSSummary() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      const res = await api.get("/sales/summary/");
      setSummary(res.data);
    } catch (err) {
      console.error("Failed loading summary:", err);
    }
  }

  if (!summary) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Sales Summary</h2>

      <div className="border rounded p-4">
        <p className="font-bold">Today: ₦{Number(summary.today_total || 0).toLocaleString()}</p>
        <p className="font-bold">This Month: ₦{Number(summary.month_total || 0).toLocaleString()}</p>
      </div>
    </div>
  );
}
