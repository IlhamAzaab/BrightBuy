import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function Checkout() {
  const { user } = useContext(AuthContext);
  const [cartData, setCartData] = useState({ items: [], summary: { subTotal: 0 } });
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9000";

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const normalize = (s) => (s || "").replace(/\\/g, "/");

  // Load cart items
  const loadCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/api/cart`);
      setCartData(res.data);
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-12 text-center">
          <p className="text-gray-600 mb-4">Please log in to proceed to checkout.</p>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-12 text-center">Loading...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {cartData.items.map((item) => (
        <div
          key={item.Cart_Item_ID}
          className="border p-2 rounded-lg flex flex-col items-center"
        >
          {/* Product Image */}
          <img
            src={item.Image_URL || "/images/default.jpg"}
            alt={item.Product_Name}
            className="w-32 h-32 object-cover rounded mb-2"
          />

          {/* Product Details */}
          <div className="text-center">
            <p className="font-semibold text-gray-800">{item.Product_Name}</p>
            <p className="text-gray-500 text-sm">
              {item.Colour && `• ${item.Colour}`}{" "}
              {item.Size && `• ${item.Size}GB`}
            </p>
            <p className="text-gray-700 text-sm mt-1">
              Price: {formatPrice(item.Price)}
            </p>
            <p className="text-gray-700 text-sm mt-1">Quantity: {item.Quantity}</p>
            <p className="text-gray-800 font-bold mt-1">
              Subtotal: {formatPrice(item.Price * item.Quantity)}
            </p>
          </div>
        </div>
      ))}
    </div>

  {/* Order Total */}
  {cartData.items.length > 0 && (
    <div className="text-right mt-6 text-lg font-bold text-green-700">
      Total: {formatPrice(cartData.items.reduce((sum, i) => sum + i.Price * i.Quantity, 0))}
    </div>
  )}

{/* Order Total */}
{cartData.items.length > 0 && (
  <div className="text-right mt-4 text-lg font-bold text-green-700">
    Total: {formatPrice(cartData.items.reduce((sum, i) => sum + i.Price * i.Quantity, 0))}
  </div>
)}

      <Footer />
    </>
  );
}
