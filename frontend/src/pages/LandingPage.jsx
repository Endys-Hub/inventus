import React from "react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Point of Sale (POS)",
    desc: "Process sales quickly with a clean, intuitive POS interface built for speed.",
  },
  {
    title: "Inventory Management",
    desc: "Track stock levels in real time and never lose sight of what you have on hand.",
  },
  {
    title: "Sales Tracking",
    desc: "View complete sales history with itemized breakdowns and daily summaries.",
  },
  {
    title: "Low Stock Alerts",
    desc: "Get notified automatically when products fall below their reorder threshold.",
  },
  {
    title: "Purchase Tracking",
    desc: "Record supplier purchases and watch stock levels update instantly on receipt.",
  },
  {
    title: "Business Insights",
    desc: "Monitor revenue, expenses, and profit from a single dashboard overview.",
  },
];

const steps = [
  { num: "1", title: "Add your products", desc: "Set up categories, suppliers, and product listings with pricing and stock levels." },
  { num: "2", title: "Sell using the POS", desc: "Process transactions at the counter with a fast, role-based point-of-sale interface." },
  { num: "3", title: "Track everything in real time", desc: "Watch inventory, sales, and expenses update automatically as your business moves." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">Inventus</span>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Run your business with<br className="hidden sm:block" /> clarity and control
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            Manage inventory, track sales, and operate your store from one simple system.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-7 py-3 rounded transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-7 py-3 rounded transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-lg text-gray-600 leading-relaxed">
            Manual tracking leads to errors, lost sales, and confusion.{" "}
            <span className="text-gray-900 font-semibold">Inventus</span> helps you stay
            organized and in control — so you can focus on growing your business, not
            firefighting.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Everything you need to run your store</h2>
            <p className="text-gray-500 mt-3">Built for small and growing businesses.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How it works</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Start managing your business today
          </h2>
          <p className="text-blue-100 mb-8">
            Set up in minutes. No technical knowledge required.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded hover:bg-blue-50 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-gray-900">Inventus</span>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Inventus. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
