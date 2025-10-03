import React, { useContext } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import { AuthContext } from "../context/AuthContext";
import Orders from "../pages/Orders";
import Admin from "../pages/Admin/admin";
import ReportsPage from "../pages/Admin/reports";
import AddAdmin from "../pages/AddAdmin";
import Profile from "../pages/profile";

// Existing pages
import Home from "../pages/Home";
import CustomerProductList from "../pages/Customerproductlistpage/CustomerProductsList";
import ProductDetails from "../pages/Customerproductlistpage/ProductDetails";
import Cart from "../pages/Cart";

// New Admin pages
import Admin from "../pages/Admin/admin";
import AddProduct from "../pages/Admin/addproduct";
import AddAdmin from "../pages/Admin/AddAdmin";
import ProductList from "../pages/Admin/ProductList";
import Report from "../pages/Admin/reports";


export default function AppRoutes() {
  const { user } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/signup" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<CustomerProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        {/* Auth routes */}
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin routes */}
        <Route path="/admin" element={<Admin />}>
          {/* Default page when admin visits /admin */}
          <Route index element={<Navigate to="addproduct" />} />
          <Route path="addproduct" element={<AddProduct />} />
          <Route path="addadmin" element={<AddAdmin />} />
          <Route path="productlist" element={<ProductList />} />
          <Route path="report" element={<Report />} />
        </Route>

        {/* Protected routes */}
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

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
