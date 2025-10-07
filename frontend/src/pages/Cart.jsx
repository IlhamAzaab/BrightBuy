import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const API_BASE = "http://localhost:9000"; // backend URL

export default function Cart() {
  const { user, token } = useContext(AuthContext); // ✅ Get token from context
  console.log("User:", user);
  console.log("Token:", token);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Handles Cloudinary and local backend URLs
  const getProductImageUrl = (imageUrl) => {
    if (!imageUrl) return "/images/default.jpg";
    if (imageUrl.startsWith("http")) return imageUrl; // Cloudinary
    return `${API_BASE}/${imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl}`;
  };

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return setLoading(false); // No token, can't fetch

      try {
       const res = await axios.get(`${API_BASE}/api/cart`);


        const { items, summary } = res.data;

        items.forEach((item) => {
          console.log("🛒", item.Product_Name);
          console.log(" - DB Image_URL:", item.Image_URL);
          console.log(" - Final URL:", getProductImageUrl(item.Image_URL));
        });

        setCartItems(items);
        setTotal(summary.subTotal);
      } catch (err) {
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  if (!user) return <div className="p-8 text-center">Please log in to view your cart</div>;
  if (loading) return <div className="p-8 text-center">Loading cart...</div>;
  if (cartItems.length === 0) return <div className="p-8 text-center">Your cart is empty 🛒</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Your Cart</h1>
      <div className="space-y-6">
        {cartItems.map((item) => (
          <div key={item.Cart_Item_ID} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow">
            <div className="flex items-center space-x-4">
              <img
                src={getProductImageUrl(item.Image_URL)}
                alt={item.Product_Name}
                className="w-16 h-16 object-cover rounded-lg border"
                onError={(e) => (e.target.src = "/images/default.jpg")}
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{item.Product_Name}</h2>
                <p className="text-sm text-gray-500">Colour: {item.Colour} | Size: {item.Size}</p>
                <p className="text-sm text-gray-500">Qty: {item.Quantity}</p>
              </div>
            </div>
            <p className="text-lg font-medium text-gray-700">
              Rs. {(item.Price * item.Quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-right">
        <h2 className="text-2xl font-bold text-gray-900">Total: Rs. {total.toFixed(2)}</h2>
        <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
