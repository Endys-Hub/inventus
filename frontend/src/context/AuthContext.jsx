import { createContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("hasSession");
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout/");
    } catch {
      // Ignore errors — still clear local session
    }
    clearSession();
    setUser(null);
  }, []);

  // ─── Listen for forced logout from interceptor ────────────────────────────
  useEffect(() => {
    const handleForceLogout = () => {
      clearSession();
      setUser(null);
    };

    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, []);

  // ─── Restore session on page load ─────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        // ✅ Ensure CSRF cookie is set BEFORE any POST request
        await api.get("/auth/csrf/", { withCredentials: true });
      } catch {
        // Not fatal — app can still proceed
      }

      const token = localStorage.getItem("token");
      const hasSession = localStorage.getItem("hasSession");

      // ─── Case 1: No token but user had session → try refresh ───────────────
      if (!token && hasSession) {
        try {
          const { data: refreshData } = await api.post("/auth/refresh/");
          localStorage.setItem("token", refreshData.access);

          const { data: userData } = await api.get("/auth/me/");
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        } catch {
          clearSession();
          setUser(null);
        } finally {
          setLoading(false);
        }
        return;
      }

      // ─── Case 2: Token exists → validate it ────────────────────────────────
      if (token) {
        try {
          const { data: userData } = await api.get("/auth/me/");
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        } catch {
          clearSession();
          setUser(null);
        } finally {
          setLoading(false);
        }
        return;
      }

      // ─── Case 3: First-time user ───────────────────────────────────────────
      setUser(null);
      setLoading(false);
    };

    initAuth();
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post("/auth/login/", { email, password });

    localStorage.setItem("token", res.data.access);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("hasSession", "true");

    setUser(res.data.user);
  };

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = async (email, password, businessName) => {
    const res = await api.post("/auth/register/", {
      email,
      password,
      business_name: businessName,
    });

    localStorage.setItem("token", res.data.access);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("hasSession", "true");

    setUser(res.data.user);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};



