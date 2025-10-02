import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import { AuthContext } from "../context/AuthContext";
import Orders from "../pages/Orders";
import Admin from "../pages/Admin/admin";
import ReportsPage from "../pages/Admin/reports";
import AddAdmin from "../pages/AddAdmin";
import Profile from "../pages/profile";

// Public pages
import Home from "../pages/Home";
import CustomerProductList from "../pages/Customerproductlistpage/CustomerProductsList";
import ProductDetails from "../pages/Customerproductlistpage/ProductDetails";

// Protected pages (require login)
import Cart from "../pages/Cart";

import AdminProductList from "../pages/AdminProductList";
export default function AppRoutes() {
  const { user } = useContext(AuthContext);

  // ProtectedRoute only wraps pages that require login
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/signup" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes (accessible to everyone) */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<CustomerProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin route */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/addadmin" element={<AddAdmin />} />
        <Route
          path="/admin/products"
          element={
            // Use AdminRoute here if you want to restrict by role
            // <AdminRoute><AdminProductList /></AdminRoute>
            <AdminProductList />
          }
        />

        {/* Protected routes (only logged in users can access) */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
