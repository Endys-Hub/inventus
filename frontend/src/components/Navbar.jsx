import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/products", label: "Products" },
    { to: "/categories", label: "Categories" },
    { to: "/pos", label: "POS" },
    { to: "/sales", label: "Sales" },
    { to: "/summary", label: "Summary" },
    { to: "/expenses", label: "Expenses" },
  ];

  return (
    <nav className="bg-gray-900 text-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <span className="font-semibold text-white tracking-wide">Inventus</span>
            <div className="hidden md:flex space-x-4">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="hover:text-blue-400">{label}</Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
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

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded text-gray-300 hover:text-white hover:bg-gray-700"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-700 px-4 pb-4 space-y-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="block py-2 hover:text-blue-400"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/change-password"
            className="block py-2 hover:text-blue-400 text-sm"
            onClick={() => setMenuOpen(false)}
          >
            Change Password
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left py-2 text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
