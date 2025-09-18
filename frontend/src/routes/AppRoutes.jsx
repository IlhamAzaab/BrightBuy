import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import { AuthContext } from "../context/AuthContext";
import Orders from "../pages/Orders";

// Public pages
import Home from "../pages/Home";
import CustomerProductList from "../pages/Customer Product List Page/CustomerProductsList";
import ProductDetails from "../pages/Customer Product List Page/ProductDetails";

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
    <BrowserRouter>
      <Routes>
        {/* Public routes (accessible to everyone) */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<CustomerProductList />} />
        <Route path="/products/:id" element={<ProductDetails/>}/>

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
        <Route path="/orders" element={<Orders />} />

        {/*<Route 
          path ="/orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
        }/>*/}

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
