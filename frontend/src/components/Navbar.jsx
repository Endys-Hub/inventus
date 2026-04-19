import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <span className="font-semibold text-white tracking-wide">Inventus</span>
        <div className="flex space-x-4">
        <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
        <Link to="/products" className="hover:text-blue-400">Products</Link>
        <Link to="/categories" className="hover:text-blue-400">Categories</Link>
        <Link to="/pos" className="hover:text-blue-400">POS</Link>
        <Link to="/sales" className="hover:text-blue-400">Sales</Link>
        <Link to="/summary" className="hover:text-blue-400">Summary</Link>
        <Link to="/expenses" className="hover:text-blue-400">Expenses</Link>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Link to="/change-password" className="hover:text-blue-400 text-sm">
          Change Password
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
