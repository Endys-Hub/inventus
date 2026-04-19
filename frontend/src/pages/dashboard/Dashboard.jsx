import { useContext, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Navbar from "../../components/Navbar";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useDashboard } from "../../hooks/useDashboard";

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

function fmt(n) {
  return `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
}

function StatCard({ label, value, isCurrency, positive }) {
  const colorClass =
    positive === undefined
      ? "text-gray-900"
      : positive
      ? "text-emerald-600"
      : "text-red-500";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>
        {isCurrency ? fmt(value) : value.toLocaleString()}
      </p>
    </div>
  );
}

function ChartSection({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm col-span-2 flex items-center justify-center h-48 text-gray-400">
        No sales data for this period.
      </div>
    );
  }

  const chartData = data.map((d) => ({ ...d, date: fmtDate(d.date) }));

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#3b82f6"
              fill="url(#revGrad)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue vs Expenses</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function LowStockPanel({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-xl border border-amber-200 shadow-sm">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-100">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">
          {products.length}
        </span>
        <h3 className="text-sm font-semibold text-amber-700">Low Stock Alerts</h3>
        <span className="text-xs text-gray-400 ml-auto">≤ 10 units remaining</span>
      </div>
      <ul className="divide-y divide-gray-100">
        {products.map((p) => (
          <li key={p.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <span className="text-sm font-medium text-gray-800">{p.name}</span>
              {p.sku && <span className="ml-2 text-xs text-gray-400">#{p.sku}</span>}
            </div>
            <span
              className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                p.stock === 0
                  ? "bg-red-100 text-red-600"
                  : p.stock <= 3
                  ? "bg-orange-100 text-orange-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              {p.stock} left
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [period, setPeriod] = useState("month");
  const { metrics, lowStock, loading, error } = useDashboard(period, user?.role);

  const isCashier = user?.role === "CASHIER";

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.business_name || user?.email || "User"}!
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isCashier ? "POS Overview" : "Business Overview"}
            </p>
          </div>

          {!isCashier && (
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {PERIODS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPeriod(value)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    period === value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cashier view */}
        {isCashier && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <p className="text-gray-500">Head to the POS to start a sale.</p>
            <a
              href="/pos"
              className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Open POS
            </a>
          </div>
        )}

        {/* Loading */}
        {!isCashier && loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-24" />
            ))}
          </div>
        )}

        {/* Error */}
        {!isCashier && !loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-600">
            Failed to load dashboard data. Please refresh.
          </div>
        )}

        {/* Metrics */}
        {!isCashier && !loading && !error && metrics && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Sales" value={metrics.total_sales} isCurrency={false} />
              <StatCard label="Revenue" value={metrics.revenue} isCurrency />
              <StatCard label="Expenses" value={metrics.expenses} isCurrency />
              <StatCard
                label="Profit"
                value={metrics.profit}
                isCurrency
                positive={metrics.profit >= 0}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChartSection data={metrics.chart_data} />
            </div>

            {/* Low stock */}
            <LowStockPanel products={lowStock} />
          </>
        )}
      </div>
    </>
  );
}
