import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function Cart() {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [cartData, setCartData] = useState({ items: [], summary: { subTotal: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9000";

  // Format currency
  const formatPrice = (amount) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  // Get product image URL - try backend first, then fallback to frontend
  const getProductImageUrl = (imageUrl, productName) => {
    if (imageUrl) {
      // If we have an image URL from database, try to use it from backend
      return `${API_BASE}${imageUrl}`;
    }
    // Fallback to frontend default image
    return "/images/default.jpg";
  };

  // Load cart data
  const loadCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Debug authentication
    console.log("=== CART AUTH DEBUG ===");
    console.log("User:", user);
    console.log("Token:", token ? "Present" : "Missing");
    console.log("Token length:", token ? token.length : 0);
    console.log("Authorization header:", axios.defaults.headers.common["Authorization"]);

    try {
      const response = await axios.get(`${API_BASE}/api/cart`);
      setCartData(response.data);
      setError(null);
      console.log("✅ Cart loaded successfully");
      
      // Debug image URLs
      console.log("=== IMAGE DEBUG ===");
      response.data.items.forEach((item, index) => {
        console.log('Item' `${index + 1}: ${item.Product_Name}`);
        console.log(`  - Database Image_URL: ${item.Image_URL}`);
        console.log(`  - Full URL: ${getProductImageUrl(item.Image_URL, item.Product_Name)}`);
      });
      
    } catch (err) {
      console.error("❌ Cart load error:", err);
      console.log("Error status:", err.response?.status);
      console.log("Error data:", err.response?.data);
      
      if (err.response?.status === 403) {
        setError("Authentication failed. Please log in again.");
      } else {
        setError("Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  // Update item quantity
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.patch(`${API_BASE}`/'api'/'cart'/'item'/`${cartItemId}`, { qty: newQuantity });
      await loadCart(); // Reload cart to get updated totals
    } catch (err) {
      alert("Failed to update quantity");
      console.error("Update quantity error:", err);
    }
  };

  // Remove item from cart
  const removeItem = async (cartItemId) => {
    try {
      await axios.delete(`${API_BASE}`/'api'/'cart'/'item'/`${cartItemId}`);
      await loadCart(); // Reload cart
    } catch (err) {
      alert("Failed to remove item");
      console.error("Remove item error:", err);
    }
  };

  // Calculate totals
  const subTotal = cartData.items.reduce((sum, item) => 
    sum + (Number(item.Price) * item.Quantity), 0
  );

  // Get cart count
  const getCartCount = () => {
    return cartData.items.reduce((total, item) => total + item.Quantity, 0);
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Shopping Cart</h1>
            <p className="text-gray-600 mb-6">Please log in to view your cart</p>
            <button 
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Log In
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-12">
          <div className="text-center">Loading cart...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-12">
          <div className="text-center text-red-600">
            <p className="mb-4">{error}</p>
            {error.includes("Authentication failed") && (
              <button 
                onClick={() => navigate("/login")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Log In Again
              </button>
            )}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (cartData.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Shopping Cart</h1>
            <p className="text-gray-600 mb-6">Your cart is empty</p>
            <button 
              onClick={() => navigate("/products")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500">
              Your <span className="font-medium text-orange-600">Cart</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80">{getCartCount()} Items</p>
          </div>

          {/* Cart Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="text-left">
                <tr>
                  <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Product Details
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Price
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Quantity
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {cartData.items.map((item) => {
                  const imageUrl = getProductImageUrl(item.Image_URL, item.Product_Name);
                  
                  return (
                    <tr key={item.Cart_Item_ID}>
                      <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                        <div>
                          <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
                            <img
                              src={imageUrl}
                              alt={item.Product_Name}
                              className="w-16 h-auto object-cover mix-blend-multiply"
                              onLoad={() => {
                                console.log(`✅ Image loaded: ${item.Product_Name} - ${imageUrl}`);
                              }}
                              onError={(e) => {
                                console.log(`❌ Image failed: ${item.Product_Name} - ${imageUrl}`);
                                // Try fallback to frontend default image
                                if (e.target.src !== "/images/default.jpg") {
                                  e.target.src = "/images/default.jpg";
                                } else {
                                  // If even frontend default fails, show placeholder
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `
                                    <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                      </svg>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          </div>
                          <button
                            className="md:hidden text-xs text-orange-600 mt-1"
                            onClick={() => removeItem(item.Cart_Item_ID)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-sm hidden md:block">
                          <p className="text-gray-800">{item.Product_Name}</p>
                          {(item.Colour || item.Size) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.Colour && `${item.Colour}`}
                              {item.Colour && item.Size && " • "}
                              {item.Size && `${item.Size}GB`}
                            </p>
                          )}
                          <button
                            className="text-xs text-orange-600 mt-1"
                            onClick={() => removeItem(item.Cart_Item_ID)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">
                        {formatPrice(Number(item.Price))}
                      </td>
                      <td className="py-4 md:px-4 px-1">
                        <div className="flex items-center md:gap-2 gap-1">
                          <button 
                            onClick={() => updateQuantity(item.Cart_Item_ID, item.Quantity - 1)}
                            disabled={item.Quantity <= 1}
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <input 
                            type="text" 
                            value={item.Quantity} 
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              updateQuantity(item.Cart_Item_ID, newQty);
                            }}
                            className="w-8 border text-center rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="1"
                          />
                          <button 
                            onClick={() => updateQuantity(item.Cart_Item_ID, item.Quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">
                        {formatPrice(Number(item.Price) * item.Quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Continue Shopping Button */}
          <button 
            onClick={() => navigate('/products')} 
            className="group flex items-center mt-6 gap-2 text-orange-600 hover:text-orange-700"
          >
            <svg 
              className="group-hover:-translate-x-1 transition w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Continue Shopping
          </button>
        </div>

        {/* Order Summary */}
        <div className="w-full md:w-80">
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
            
            {/* Pricing Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items</span>
                <span>{getCartCount()}</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(subTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button 
              onClick={() => navigate("/checkout")}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}