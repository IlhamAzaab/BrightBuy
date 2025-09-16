import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import { AuthContext } from "../context/AuthContext";

// Public pages
import Home from "../pages/Home";
import CustomerProductList from "../pages/Customer Product List Page/CustomerProductsList"

// Protected pages (require login)
import Cart from "../pages/Cart";

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
    <Router>
      <Routes>
        {/* Public routes (accessible to everyone) */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<CustomerProductList />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes (only logged in users can access) */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
