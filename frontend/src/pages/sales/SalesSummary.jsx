import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import SaleDetailModal from "./SaleDetailModal"; // optional, keep if you have it

export default function SalesSummary() {
  const [loading, setLoading] = useState(true);

  // Sales summary state
  const [salesSummary, setSalesSummary] = useState({
    totalSales: 0,
    totalTransactions: 0,
    averageSale: 0,
    paymentBreakdown: { cash: 0, pos: 0, transfer: 0 },
  });
  const [recentSales, setRecentSales] = useState([]);

  // Expenses summary state
  const [expensesSummary, setExpensesSummary] = useState({
    totalExpenses: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState([]);

  // UI
  const [filterDate, setFilterDate] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Sales summary
      const salesParams = {};
      if (filterDate) salesParams.date = filterDate;
      const salesRes = await api.get("/sales/summary/", { params: salesParams });
      // expect { summary: {...}, sales: [...] } OR fallback fields
      const salesData = salesRes.data || {};
      setSalesSummary({
        totalSales: salesData.summary?.totalSales ?? salesData.totalSales ?? 0,
        totalTransactions:
          salesData.summary?.totalTransactions ?? salesData.totalTransactions ?? 0,
        averageSale: salesData.summary?.averageSale ?? salesData.averageSale ?? 0,
        paymentBreakdown:
          salesData.summary?.paymentBreakdown ?? salesData.paymentBreakdown ?? {
            cash: 0,
            pos: 0,
            transfer: 0,
          },
      });
      setRecentSales(salesData.sales ?? salesData.recent_sales ?? []);

      // Expenses summary
      const expParams = {};
      if (filterDate) expParams.start_date = filterDate; // if your endpoint expects start/end, adjust accordingly
      const expRes = await api.get("/expenses/summary/", { params: expParams });
      const expData = expRes.data || {};
      // If your expenses summary endpoint returns { total_expense } or { totalExpenses }
      const totalExpenses = expData.total_expense ?? expData.total_expenses ?? expData.totalExpenses ?? 0;
      setExpensesSummary({ totalExpenses });
      // Also fetch recent expenses list for the same filter
      const listRes = await api.get("/expenses/", { params: filterDate ? { date: filterDate } : {} });
      setRecentExpenses(listRes.data?.results ?? []);
    } catch (err) {
      console.error("Error loading summary:", err);
      alert("Failed to load summary data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate]);

  const netProfit = Number(salesSummary.totalSales || 0) - Number(expensesSummary.totalExpenses || 0);

  return (
    <>
      <Navbar />

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Business Summary</h2>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border p-2 rounded"
          />
          <button onClick={fetchAll} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Apply
          </button>
          <button
            onClick={() => { setFilterDate(""); fetchAll(); }}
            className="bg-gray-300 px-3 py-2 rounded hover:bg-gray-400"
          >
            Reset
          </button>
        </div>

        {loading ? (
          <p>Loading summary...</p>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-100 rounded shadow">
                <p className="text-gray-600">Total Sales</p>
                <p className="text-xl font-bold">₦{Number(salesSummary.totalSales || 0).toLocaleString()}</p>
              </div>

              <div className="p-4 bg-gray-100 rounded shadow">
                <p className="text-gray-600">Total Expenses</p>
                <p className="text-xl font-bold">₦{Number(expensesSummary.totalExpenses || 0).toLocaleString()}</p>
              </div>

              <div className="p-4 bg-gray-100 rounded shadow">
                <p className="text-gray-600">Net Profit</p>
                <p className="text-xl font-bold">₦{Number(netProfit).toLocaleString()}</p>
              </div>

              <div className="p-4 bg-gray-100 rounded shadow">
                <p className="text-gray-600">Avg Sale</p>
                <p className="text-xl font-bold">₦{Number(salesSummary.averageSale || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Payment breakdown */}
            <div className="mb-6 p-4 bg-white rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Payment Breakdown</h3>
              <div className="flex gap-4">
                <div>Cash: ₦{Number(salesSummary.paymentBreakdown.cash || 0).toLocaleString()}</div>
                <div>POS: ₦{Number(salesSummary.paymentBreakdown.pos || 0).toLocaleString()}</div>
                <div>Transfer: ₦{Number(salesSummary.paymentBreakdown.transfer || 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Sales */}
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold mb-3">Recent Sales</h3>
                {recentSales.length === 0 ? (
                  <p>No sales.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-gray-600">
                      <tr>
                        <th className="p-2">ID</th>
                        <th className="p-2">Date</th>
                        <th className="p-2">Total</th>
                        <th className="p-2">Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSales.map((s) => (
                        <tr key={s.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedSale(s)}>
                          <td className="p-2">{s.id}</td>
                          <td className="p-2">{new Date(s.created_at).toLocaleString()}</td>
                          <td className="p-2">₦{Number(s.total_amount).toLocaleString()}</td>
                          <td className="p-2">{s.payment_method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Recent Expenses */}
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold mb-3">Recent Expenses</h3>
                {recentExpenses.length === 0 ? (
                  <p>No expenses.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-gray-600">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Category</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentExpenses.map((e) => (
                        <tr key={e.id} className="border-b">
                          <td className="p-2">{e.date}</td>
                          <td className="p-2">{e.category}</td>
                          <td className="p-2 text-right">₦{Number(e.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* Sale details modal (optional) */}
        {selectedSale && (
          <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
        )}
      </div>
    </>
  );
}

