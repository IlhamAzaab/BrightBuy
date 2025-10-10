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

  // Get product image URL for selected variant
  const getProductImageUrl = (item) => {
    return (
      item.Image_URL ||         // Variant image from cart
      item.Variants?.[0]?.Image_URL || // fallback first variant
      item.Product_Image ||     // fallback main product image
      ""                        // empty if nothing
    );
  };

  // Normalize path for backend
  const normalize = (s) => (s || "").replace(/\\/g, "/");

  // Load cart data
  const loadCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/api/cart`);
      setCartData(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load cart", err);
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
      await axios.patch(`${API_BASE}/api/cart/item/${cartItemId}`, { qty: newQuantity });
      await loadCart();
    } catch (err) {
      alert("Failed to update quantity");
      console.error(err);
    }
  };

  // Remove item from cart
  const removeItem = async (cartItemId) => {
    try {
      await axios.delete(`${API_BASE}/api/cart/item/${cartItemId}`);
      await loadCart();
    } catch (err) {
      alert("Failed to remove item");
      console.error(err);
    }
  };

  // Total items count
  const getCartCount = () => cartData.items.reduce((total, item) => total + item.Quantity, 0);

  // Total price
  const subTotal = cartData.items.reduce((sum, item) => sum + Number(item.Price) * item.Quantity, 0);

  // --- RENDER ---

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-12 text-center">
          <p className="text-gray-600 mb-4">Please log in to view your cart</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-12 text-center">Loading cart...</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-12 text-center text-red-600">
          <p>{error}</p>
          {error.includes("Authentication failed") && (
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
            >
              Log In Again
            </button>
          )}
        </div>
        <Footer />
      </>
    );
  }

  if (cartData.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-12 text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </button>
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
          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500">
              Your <span className="font-medium text-orange-600">Cart</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80">{getCartCount()} Items</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="text-left">
                <tr>
                  <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Product Details
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">Price</th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">Quantity</th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cartData.items.map((item) => {
                  const imageUrl = getProductImageUrl(item);
                  return (
                    <tr key={item.Cart_Item_ID}>
                      <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                        <div>
                          <div className="rounded-lg overflow-hidden border border-gray-300 p-2 w-14 h-14 flex items-center justify-center">
                            <img
                              src={item.Image_URL || "/images/default.jpg"}
                              alt={item.Product_Name}
                              className="w-16 h-16 object-cover rounded"
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
                            -
                          </button>
                          <input
                            type="text"
                            value={item.Quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              updateQuantity(item.Cart_Item_ID, newQty);
                            }}
                            className="w-8 border text-center rounded"
                            min="1"
                          />
                          <button
                            onClick={() => updateQuantity(item.Cart_Item_ID, item.Quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                          >
                            +
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

          <button
            onClick={() => navigate("/products")}
            className="group flex items-center mt-6 gap-2 text-orange-600 hover:text-orange-700"
          >
            &larr; Continue Shopping
          </button>
        </div>

        {/* Order Summary */}
        <div className="w-full md:w-80">
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

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

            <button
              onClick={() => navigate("/products/cart/checkout")}
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
