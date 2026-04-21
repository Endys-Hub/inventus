import { useState, useEffect, useCallback } from "react";
import { fetchDashboardMetrics, fetchLowStockProducts } from "../services/api";

export function useDashboard(period, role) {
  const [metrics, setMetrics] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (role === "CASHIER") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, lowStockRes] = await Promise.all([
        fetchDashboardMetrics(period),
        fetchLowStockProducts(10),
      ]);
      setMetrics(metricsRes.data);
      const raw = lowStockRes.data;
      setLowStock(Array.isArray(raw) ? raw : (raw?.results ?? []));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [period, role]);

  useEffect(() => {
    load();
  }, [load]);

  return { metrics, lowStock, loading, error };
}
