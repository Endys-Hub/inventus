import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const uidParam = params.get("uid");
  const tokenParam = params.get("token");

  const [form, setForm] = useState({ uid: uidParam || "", token: tokenParam || "", new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.new_password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/password-reset-confirm/", {
        uid: form.uid,
        token: form.token,
        new_password: form.new_password,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.new_password?.[0];
      setError(detail || "Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm mx-4 sm:mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Inventus</h1>
          <p className="text-sm text-gray-500 mt-1">POS &amp; Inventory Management System</p>
        </div>

        <h2 className="text-lg font-semibold mb-1">Set New Password</h2>
        <p className="text-sm text-gray-500 mb-4">
          Your reset credentials are pre-filled. Just choose a new password.
        </p>

        {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="border p-2 w-full font-mono text-sm"
            placeholder="UID"
            value={form.uid}
            onChange={set("uid")}
            required
          />
          <input
            type="text"
            className="border p-2 w-full font-mono text-sm"
            placeholder="Token"
            value={form.token}
            onChange={set("token")}
            required
          />
          <input
            type="password"
            className="border p-2 w-full"
            placeholder="New password"
            value={form.new_password}
            onChange={set("new_password")}
            required
          />
          <input
            type="password"
            className="border p-2 w-full"
            placeholder="Confirm new password"
            value={form.confirm_password}
            onChange={set("confirm_password")}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-4 text-sm">
          <Link to="/login" className="text-blue-600">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
