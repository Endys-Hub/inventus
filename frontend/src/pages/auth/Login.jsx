import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password); // 🔥 THIS IS THE FIX
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Invalid login credentials");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm mx-4 sm:mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Inventus</h1>
          <p className="text-sm text-gray-500 mt-1">POS &amp; Inventory Management System</p>
        </div>
        <h2 className="text-lg font-semibold mb-4">Login</h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            className="border p-2 w-full"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="border p-2 w-full"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-sm">
          New user?{" "}
          <Link to="/register" className="text-blue-600">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}


