import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  // For now use test user (replace later with AuthContext)
  const user = { id: 1, name: "Alice" };
  // const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.id) {
      fetchOrders(tab);
    }
  }, [tab, user?.id]); // ✅ Fixed: Only depend on user.id, not the entire user object

  const fetchOrders = async (status) => {
    setLoading(true);
    try {
      const res = await fetch(
          `http://localhost:9000/api/orders?userId=${user.id}&status=${status}&_t=${Date.now()}`
      );
      const data = await res.json();
      console.log("✅ Orders fetched:", data);
      setOrders(data);
    } catch (err) {
      console.error("❌ Failed to fetch orders", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async (orderId) => {
    try {
      await fetch(`http://localhost:9000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      fetchOrders("pending"); // refresh pending orders
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded ${
            tab === "pending" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`px-4 py-2 rounded ${
            tab === "completed" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Order History
        </button>
      </div>

      {/* Orders */}
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No {tab} orders.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border rounded-lg p-4 shadow-sm bg-white">
              <div className="flex justify-between">
                <h2 className="font-semibold">Order #{o.id}</h2>
                <span className="text-sm text-gray-600">{o.status}</span>
              </div>
              <p className="text-gray-600 text-sm">
                Placed: {new Date(o.date).toLocaleDateString()}
              </p>
              <ul className="mt-2 list-disc pl-5">
                {o.items.map((item, idx) => (
                  <li key={idx}>
                    {item.product} ({item.variant}) × {item.qty} — ₹{item.subtotal}
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-bold">Total: ₹{o.total}</p>

              {tab === "pending" && (
                <button
                  onClick={() => markCompleted(o.id)}
                  className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                >
                  Mark as Received
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;