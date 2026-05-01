import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const { data } = await api.post("/auth/password-reset/", { email });
      if (data.uid && data.token) {
        navigate(`/reset-password?uid=${data.uid}&token=${data.token}`);
        return;
      }
      setResult(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
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

        <h2 className="text-lg font-semibold mb-1">Reset Password</h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter your email address to generate a reset token.
        </p>

        {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

        {result ? (
          <div className="space-y-4">
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
              If this email exists, a reset link has been generated.
            </p>

            {result.uid && result.token ? (
              <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-2 text-sm break-all">
                <p className="text-gray-500 font-medium text-xs uppercase tracking-wide">
                  Reset credentials (no email system)
                </p>
                <div>
                  <span className="text-gray-500">UID: </span>
                  <span className="font-mono text-gray-900">{result.uid}</span>
                </div>
                <div>
                  <span className="text-gray-500">Token: </span>
                  <span className="font-mono text-gray-900">{result.token}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No account found for that email.</p>
            )}

            <button
              onClick={() => { setResult(null); setEmail(""); }}
              className="w-full border border-gray-300 text-gray-700 p-2 rounded text-sm hover:bg-gray-50"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              className="border p-2 w-full"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-60"
            >
              {loading ? "Sending..." : "Generate Reset Token"}
            </button>
          </form>
        )}

        <p className="mt-4 text-sm">
          <Link to="/login" className="text-blue-600">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
