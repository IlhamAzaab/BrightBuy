import React, { useEffect, useState } from "react";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [city, setCity] = useState("");
  const [estimate, setEstimate] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  // 🧩 Fetch data (replace these API endpoints later)
  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        // Fetch cart items with variant details
        const res = await fetch("http://localhost:9000/api/cart/checkout");
        const data = await res.json();

        setCartItems(data.cartItems);
        setCity(data.city);
        setTotalAmount(data.total);

        // Estimate delivery
        const est = calculateEstimate(data.city, data.cartItems);
        setEstimate(est);
      } catch (err) {
        console.error("Failed to fetch checkout data:", err);
      }
    };
    fetchCheckoutData();
  }, []);

  // 🚚 Estimate delivery logic
  const calculateEstimate = (city, items) => {
    const inStock = items.every((item) => item.stock > 0);
    const isMainCity = ["Colombo", "Kandy", "Galle", "Jaffna", "Trincomalee"].includes(city);
    let days = isMainCity ? 5 : 7;
    if (!inStock) days += 3;
    return `${days} days`;
  };

  return (
    <div className="flex flex-col md:flex-row justify-center gap-8 p-6 bg-gray-50 min-h-screen">
      
      {/* LEFT: Delivery + Payment + Products */}
      <div className="flex-1 space-y-6 max-w-2xl">
        {/* Delivery Method */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Delivery Method</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="radio" name="delivery" defaultChecked className="w-4 h-4 text-orange-600" />
              <span>Home Delivery</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" name="delivery" className="w-4 h-4 text-orange-600" />
              <span>Store Pickup</span>
            </label>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Payment Method</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-orange-600" />
              <span>Cash on Delivery</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" name="payment" className="w-4 h-4 text-orange-600" />
              <span>Online Payment</span>
            </label>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Product Details</h2>
          <div className="divide-y">
            {cartItems.map((item, i) => (
              <div key={i} className="py-3 flex justify-between items-center text-gray-700">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-gray-500">
                    Variant: {item.variant_name} | Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-gray-800">Rs. {item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Order Summary */}
      <div className="w-full md:w-96 bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h2>
        <div className="space-y-4 text-gray-700">
          <div className="flex justify-between">
            <p>Items</p>
            <p>{cartItems.length}</p>
          </div>
          <div className="flex justify-between">
            <p>Subtotal</p>
            <p>Rs. {totalAmount}</p>
          </div>
          <div className="flex justify-between">
            <p>Tax (2%)</p>
            <p>Rs. {Math.floor(totalAmount * 0.02)}</p>
          </div>
          <div className="flex justify-between font-semibold border-t pt-3">
            <p>Total</p>
            <p>Rs. {Math.floor(totalAmount * 1.02)}</p>
          </div>

          <div className="flex justify-between border-t pt-3">
            <p>Estimated Delivery</p>
            <p className="font-medium text-orange-600">{estimate}</p>
          </div>

          <div className="text-sm text-gray-500 pt-1">
            (Estimated based on stock and delivery location)
          </div>
        </div>

        <button className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium">
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Checkout;
