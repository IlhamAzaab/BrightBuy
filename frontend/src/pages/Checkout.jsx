// src/pages/Checkout.jsx
import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { user } = useContext(AuthContext);
  const [cartData, setCartData] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState("Standard Delivery");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [hasAddress, setHasAddress] = useState(false);
  const [editing, setEditing] = useState(false);
  const [estimatedDate, setEstimatedDate] = useState(0);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9000";
  const navigate = useNavigate();
  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  // 🧩 Load cart data
  const loadCart = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/cart`);
      setCartData(res.data);
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Load user address
  const loadAddress = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/user/address`, {
        withCredentials: true,
      });
      if (res.data?.address) {
        setAddress(res.data.address);
        setCity(res.data.city);
        setHasAddress(true);
      }
    } catch (err) {
      console.error("Failed to load address", err);
    }
  };

  const loadEstimate = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/estimate`, {
        withCredentials: true,
      });
      if (res.data.estimatedDate) {
        setEstimatedDate(res.data.estimatedDate);
      }
    } catch (err) {
      console.error("Failed to load estimate", err);
    }
  };

  // Call this after cart and address load
  useEffect(() => {
    loadCart();
    loadAddress();
    loadEstimate();
  }, [user]);

  const placeOrder = async () => {
    if (
      !address ||
      !deliveryMethod ||
      !paymentMethod ||
      !estimatedDate ||
      !cartData.items.length
    ) {
      return alert(
        "Please fill all required details before placing the order."
      );
    }

    console.log({ address, deliveryMethod, paymentMethod, estimatedDate });

    try {
      const res = await axios.post(
        `${API_BASE}/api/checkout`,
        {
          deliveryAddress: address,
          deliveryMethod,
          paymentMethod,
          estimatedDate,
          cartItems: cartData.items,
        },
        { withCredentials: true }
      );

      if (res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setCartData({ items: [], summary: { subTotal: 0 } });
          navigate("/orders"); // redirect to orders page
        }, 2000); // Show success badge for 2 seconds
      }
    } catch (err) {
      console.error("Failed to place order", err);
      alert(
        "Failed to place order: " + err.response?.data?.error || err.message
      );
    }
  };

  //Save or update address
  const handleSaveAddress = async () => {
    try {
      await axios.put(
        `${API_BASE}/api/user/address`,
        { address, city },
        { withCredentials: true }
      );
      alert("Address updated successfully!");
      setEditing(false);
      setHasAddress(true);
    } catch (err) {
      console.error("Failed to update address", err);
      alert("Failed to update address: " + err.message);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-12 text-center">
          <p className="text-gray-600 mb-4">
            Please log in to proceed to checkout.
          </p>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-12 text-center">
          Loading...
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="fixed top-16 left-0 w-full flex justify-center z-50"
            >
              <div className="text-m tracking-wide text-green-700 bg-green-100 border-2 border-green-300 px-12 py-2 rounded-full shadow-xl">
                Order Placed Successfully
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Navbar />
      <div className="flex flex-col items-center px-8 md:px-16">
        <div className="flex flex-col items-end pt-8 py-4">
          <p className="text-4xl font-medium">Final Checkout Your Order</p>
          <div className="w-24 h-0.5 bg-orange-600 rounded-full"></div>
        </div>
      </div>
      <div className="px-6 md:px-16 lg:px-32 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SECTION - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* --- 🏠 Address Section --- */}
          <div className="border p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Delivery Address
            </h2>

            {hasAddress && !editing ? (
              <div>
                <p className="text-gray-700">{address}</p>
                <p className="text-gray-600">{city}</p>
                <button
                  className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-full"
                  onClick={() => setEditing(true)}
                >
                  Change Address
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter address"
                  className="w-full border rounded p-2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Enter city"
                  className="w-full border rounded p-2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <button
                  className="px-4 py-2 bg-orange-600 text-white rounded-full"
                  onClick={handleSaveAddress}
                >
                  Save Address
                </button>
              </div>
            )}
          </div>

          {/* --- 🚚 Delivery Method --- */}
          <div className="border p-4 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Delivery Method
            </h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="delivery"
                  value="Standard Delivery"
                  checked={deliveryMethod === "Standard Delivery"}
                  onChange={() => setDeliveryMethod("Standard Delivery")}
                />
                Standard Delivery
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="delivery"
                  value="Store Pickup"
                  checked={deliveryMethod === "Store Pickup"}
                  onChange={() => setDeliveryMethod("Store Pickup")}
                />
                Store Pickup
              </label>
            </div>
          </div>

          {/* 💳 Payment Method */}
          <div className="border p-4 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Payment Method
            </h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  checked={paymentMethod === "Cash on Delivery"}
                  onChange={() => setPaymentMethod("Cash on Delivery")}
                />
                Cash on Delivery
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment"
                  value="Online Payment"
                  checked={paymentMethod === "Online Payment"}
                  onChange={() => setPaymentMethod("Online Payment")}
                />
                Online Payment
              </label>
            </div>
          </div>

          {/* --- 🛒 Cart Items --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cartData.items.map((item) => (
              <div
                key={item.Cart_Item_ID}
                className="border p-3 rounded-lg flex flex-col items-center"
              >
                <img
                  src={item.Image_URL || "/images/default.jpg"}
                  alt={item.Product_Name}
                  className="w-32 h-32 object-cover rounded mb-2"
                />
                <div className="text-center">
                  <p className="font-semibold text-gray-800">
                    {item.Product_Name}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {item.Colour && `• ${item.Colour}`}{" "}
                    {item.Size && `• ${item.Size}GB`}
                  </p>
                  <p className="text-gray-700 text-sm mt-1">
                    Price: {formatPrice(item.Price)}
                  </p>
                  <p className="text-gray-700 text-sm mt-1">
                    Qty: {item.Quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SECTION - Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 shadow-md sticky top-24 bg-white">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Order Summary
            </h2>

            <p className="flex justify-between text-gray-700 mb-2">
              <span>Total Items:</span>
              <span>{cartData.items.length}</span>
            </p>

            <p className="flex justify-between text-gray-700 mb-4">
              <span>Total Amount:</span>
              <span className="font-bold text-green-700">
                {formatPrice(
                  cartData.items.reduce(
                    (sum, i) => sum + i.Price * i.Quantity,
                    0
                  )
                )}
              </span>
            </p>

            {estimatedDate && (
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-1">
                  Estimated Delivery
                </h3>
                <p className="text-gray-700">
                  Arrives by <strong>{estimatedDate}</strong>
                </p>
              </div>
            )}

            <button
              disabled={!estimatedDate || !hasAddress}
              className="w-full bg-orange-600 text-white py-3 rounded-full hover:bg-orange-700 transition disabled:opacity-50"
              onClick={placeOrder}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
