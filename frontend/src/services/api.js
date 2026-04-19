import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL;
if (!apiBase) {
  throw new Error("VITE_API_BASE_URL is not defined. Set it in your .env file.");
}

const api = axios.create({
  baseURL: `${apiBase.replace(/\/+$/, "")}/api/`,
  withCredentials: true, // required so the browser sends the httpOnly refresh cookie
  timeout: 10000,
});

// ─── CSRF helper ─────────────────────────────────────────────────────────────
// Reads the csrftoken cookie set by Django (requires CSRF_COOKIE_HTTPONLY=False).
function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// ─── Request interceptor: attach access token + CSRF token ───────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Django's CSRF middleware validates this header on unsafe methods only.
  const unsafeMethods = ["post", "put", "patch", "delete"];
  if (unsafeMethods.includes(config.method?.toLowerCase())) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
  }

  return config;
});

// ─── Response interceptor: 401 → refresh → retry ────────────────────────────
//
// Design:
//  • A single in-flight refresh is tracked with `isRefreshing`.
//  • All 401 requests that arrive while a refresh is in progress are queued.
//  • On success the queue is flushed with the new token; on failure it is
//    rejected and a `auth:logout` window event is fired so AuthContext can
//    react without a circular import.

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

const AUTH_PATHS = ["/auth/login/", "/auth/refresh/", "/auth/register/", "/auth/logout/"];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only intercept 401s that are not from auth endpoints and haven't been retried
    if (
      !error.response ||
      error.response.status !== 401 ||
      original._retry ||
      AUTH_PATHS.some((p) => original.url.includes(p))
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the ongoing refresh resolves
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // The refresh token travels as an httpOnly cookie — no body needed
      const { data } = await api.post("/auth/refresh/");
      const newToken = data.access;

      localStorage.setItem("token", newToken);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Notify AuthContext without creating a circular import
      window.dispatchEvent(new Event("auth:logout"));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

// === SUPPLIERS ===
export const fetchSuppliers = async () => {
  const res = await api.get("/inventory/suppliers/");
  return res.data;
};

export const createSupplier = async (payload) => {
  const res = await api.post("/inventory/suppliers/", payload);
  return res.data;
};

export const updateSupplier = async (id, payload) => {
  const res = await api.put(`/inventory/suppliers/${id}/`, payload);
  return res.data;
};

export const deleteSupplier = async (id) => {
  const res = await api.delete(`/inventory/suppliers/${id}/`);
  return res.data;
};


// === PRODUCTS ===
export const fetchProducts = async () => {
  const res = await api.get("/inventory/products/");
  return res.data;
};


// === PURCHASES (Multi-Item) ===

export const fetchPurchases = async () => {
  const res = await api.get("/inventory/purchases/");
  return res.data;
};

export const createPurchase = async (payload) => {
  const res = await api.post("/inventory/purchases/", payload);
  return res.data;
};

export const fetchPurchase = async (id) => {
  const res = await api.get(`/inventory/purchases/${id}/`);
  return res.data;
};

export const updatePurchase = async (id, payload) => {
  const res = await api.put(`/inventory/purchases/${id}/`, payload);
  return res.data;
};

export const deletePurchase = async (id) => {
  const res = await api.delete(`/inventory/purchases/${id}/`);
  return res.data;
};


// === AUTH ===
export const changePassword = async (data) => {
  const res = await api.post("/auth/change-password/", data);
  return res.data;
};

// === DASHBOARD ===
export const fetchDashboardMetrics = (period) =>
  api.get("/sales/dashboard/", { params: { period } });

export const fetchLowStockProducts = (threshold = 10) =>
  api.get("/inventory/products/low-stock/", { params: { threshold } });














