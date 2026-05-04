import React from "react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Point of Sale (POS)",
    desc: "Sell quickly and record every transaction accurately — no delays, no missed sales.",
  },
  {
    title: "Inventory Management",
    desc: "Always know what you have in stock and never run out without warning.",
  },
  {
    title: "Sales Tracking",
    desc: "See exactly what you sold today, yesterday, or any time you choose.",
  },
  {
    title: "Low Stock Alerts",
    desc: "Get notified before products finish so you can restock on time.",
  },
  {
    title: "Purchase Tracking",
    desc: "Record supplier purchases and keep your stock levels accurate automatically.",
  },
  {
    title: "Business Insights",
    desc: "Know your total sales, expenses, and profit at a glance.",
  },
];

const steps = [
  { num: "1", title: "Add your products", desc: "Set up your items, prices, and stock levels in minutes." },
  { num: "2", title: "Start selling", desc: "Use the POS to record every sale as it happens." },
  { num: "3", title: "Stay in control", desc: "Watch your sales and stock update automatically in real time." },
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
            Stop losing money in your shop<br className="hidden sm:block" /> and track every sale
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            Record sales, manage stock, and know your profit — all from one simple system.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-7 py-3 rounded transition-colors"
            >
              Create Free Account
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
            Still using a notebook or trying to remember everything? This leads to missing stock,
            unrecorded sales, and no clear idea of your daily profit.{" "}
            <span className="text-gray-900 font-semibold">Inventus</span> helps you track everything
            in one place so you stay in control of your business.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Everything you need to manage your shop</h2>
            <p className="text-gray-500 mt-3">Simple tools built for small and growing businesses.</p>
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
            Start tracking your business properly today
          </h2>
          <p className="text-blue-100 mb-8">
            Set up in minutes. No technical knowledge needed. No more guesswork.
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