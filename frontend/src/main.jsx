import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ErrorFallback from "./components/ErrorFallback.jsx";

import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ChangePassword from "./pages/auth/ChangePassword.jsx";

import Dashboard from "./pages/dashboard/Dashboard.jsx";

import ProductsPage from "./pages/products/ProductsPage.jsx";
import AddProduct from "./pages/products/AddProduct.jsx";
import EditProduct from "./pages/products/EditProduct.jsx";

import CategoriesPage from "./pages/categories/CategoriesPage.jsx";
import AddCategory from "./pages/categories/AddCategory.jsx";
import EditCategory from "./pages/categories/EditCategory.jsx";

import SuppliersList from "./pages/suppliers/SuppliersList.jsx";
import AddSupplier from "./pages/suppliers/AddSupplier.jsx";
import EditSupplier from "./pages/suppliers/EditSupplier.jsx";

import PurchasesPage from "./pages/purchases/PurchasesPage.jsx";
import AddPurchase from "./pages/purchases/AddPurchase.jsx";
import EditPurchase from "./pages/purchases/EditPurchase.jsx";

import POS from "./pages/pos/POS.jsx";
import POSSummary from "./pages/pos/POSSummary.jsx";

import SalesHistory from "./pages/sales/SalesHistory.jsx";
import SalesSummary from "./pages/sales/SalesSummary.jsx";

import ExpensesList from "./pages/expenses/ExpensesList.jsx";
import AddExpense from "./pages/expenses/AddExpense.jsx";
import EditExpense from "./pages/expenses/EditExpense.jsx";

import "./index.css";

const ALL_ROLES = ["OWNER", "MANAGER", "CASHIER"];
const OWNER_MANAGER = ["OWNER", "MANAGER"];
const OWNER_ONLY = ["OWNER"];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    errorElement: <ErrorFallback />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },

      // Dashboard
      {
        path: "/dashboard",
        element: <ProtectedRoute allowedRoles={ALL_ROLES}><Dashboard /></ProtectedRoute>,
      },

      // Products
      {
        path: "/products",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><ProductsPage /></ProtectedRoute>,
      },
      {
        path: "/products/add",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><AddProduct /></ProtectedRoute>,
      },
      {
        path: "/products/edit/:id",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><EditProduct /></ProtectedRoute>,
      },

      // Categories
      {
        path: "/categories",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><CategoriesPage /></ProtectedRoute>,
      },
      {
        path: "/categories/add",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><AddCategory /></ProtectedRoute>,
      },
      {
        path: "/categories/edit/:id",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><EditCategory /></ProtectedRoute>,
      },

      // Suppliers
      {
        path: "/suppliers",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><SuppliersList /></ProtectedRoute>,
      },
      {
        path: "/suppliers/add",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><AddSupplier /></ProtectedRoute>,
      },
      {
        path: "/suppliers/edit/:id",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><EditSupplier /></ProtectedRoute>,
      },

      // Purchases
      {
        path: "/purchases",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><PurchasesPage /></ProtectedRoute>,
      },
      {
        path: "/purchases/add",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><AddPurchase /></ProtectedRoute>,
      },
      {
        path: "/purchases/edit/:id",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><EditPurchase /></ProtectedRoute>,
      },

      // POS
      {
        path: "/pos",
        element: <ProtectedRoute allowedRoles={ALL_ROLES}><POS /></ProtectedRoute>,
      },
      {
        path: "/pos-summary",
        element: <ProtectedRoute allowedRoles={ALL_ROLES}><POSSummary /></ProtectedRoute>,
      },

      // Sales
      {
        path: "/sales",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><SalesHistory /></ProtectedRoute>,
      },
      {
        path: "/summary",
        element: <ProtectedRoute allowedRoles={OWNER_MANAGER}><SalesSummary /></ProtectedRoute>,
      },

      // Expenses
      {
        path: "/expenses",
        element: <ProtectedRoute allowedRoles={OWNER_ONLY}><ExpensesList /></ProtectedRoute>,
      },
      {
        path: "/expenses/add",
        element: <ProtectedRoute allowedRoles={OWNER_ONLY}><AddExpense /></ProtectedRoute>,
      },
      {
        path: "/expenses/edit/:id",
        element: <ProtectedRoute allowedRoles={OWNER_ONLY}><EditExpense /></ProtectedRoute>,
      },

      // Change Password
      {
        path: "/change-password",
        element: <ProtectedRoute allowedRoles={ALL_ROLES}><ChangePassword /></ProtectedRoute>,
      },

      // Fallback
      { path: "*", element: <Login /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
