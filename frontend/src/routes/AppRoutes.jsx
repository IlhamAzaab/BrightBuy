import React, { useContext } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import { AuthContext } from "../context/AuthContext";
import Orders from "../pages/Orders";
import Profile from "../pages/profile";

// Existing pages
import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import CustomerProductList from "../pages/Customerproductlistpage/CustomerProductsList";
import ProductDetails from "../pages/Customerproductlistpage/ProductDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";

// Admin pages
import Admin from "../pages/Admin/admin";
import AddProduct from "../pages/Admin/AddProduct";
import AddAdmin from "../pages/Admin/AddAdmin";
import ProductList from "../pages/Admin/ProductList";
import CustomerSummaryReport from "../pages/Admin/CustomerSummaryReport";
import QuarterlySalesReport from "../pages/Admin/quarterlysales";
import TopProductsReport from "../pages/Admin/TopProductsReport";
import TopSellingProductsReport from "../pages/Admin/TopProductsReport";

export default function AppRoutes() {
  const { user } = useContext(AuthContext);

  const ProtectedRoute = ({ children, role }) => {
    if (!user) return <Navigate to="/signup" replace />;
    if (role && user.role !== role) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<CustomerProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/products/cart/checkout" element={<Checkout />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        >
          {/* Default page when admin hits /admin */}
          <Route index element={<Navigate to="addproduct" replace />} />
          <Route path="addproduct" element={<AddProduct />} />
          <Route path="addadmin" element={<AddAdmin />} />
          <Route path="productlist" element={<ProductList />} />

          {/* Reports hub */}
          {/* Customer Summary & Payments (no navbar in that page component) */}
          <Route
            path="report/customer-summary"
            element={<CustomerSummaryReport />}
          />
          <Route
            path="report/quarterly-sales"
            element={<QuarterlySalesReport />}
          />
          <Route path="report/top-products" element={<TopProductsReport />} />
          <Route
            path="/admin/report/top-selling"
            element={
              <ProtectedRoute role="admin">
                <TopSellingProductsReport />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Protected customer routes */}
        <Route
          path="/products/cart"
          element={
            <ProtectedRoute>
              <Cart />
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

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
