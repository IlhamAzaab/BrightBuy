import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  const { user: authUser } = useContext(AuthContext);
  const user = authUser;

  const fetchOrders = useCallback(
    async (status) => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:9000/api/orders?userId=${
            user.id
          }&status=${status}&_t=${Date.now()}`
        );
        const data = await res.json();
        console.log("✅ Orders fetched:", data);
        // Defensive: ensure we always store an array
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data && typeof data === "object" && data.error) {
          console.warn("Server returned error object:", data);
          setOrders([]);
        } else {
          console.warn(
            "Unexpected orders payload, coercing to empty array:",
            data
          );
          setOrders([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch orders", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [user.id]
  );

  useEffect(() => {
    if (user?.id) {
      fetchOrders(tab);
    }
  }, [tab, user?.id, fetchOrders]);

  const markCompleted = async (orderId) => {
    try {
      const res = await fetch(
        `http://localhost:9000/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to update order status", data);
        return;
      }

      // Optimistic update: remove from pending list immediately
      if (tab === "pending") {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
      // If we're on completed tab and it was already delivered but missing, refetch
      if (tab === "completed" && data.alreadyDelivered) {
        fetchOrders("completed");
      }
      // If user currently on pending and wants to view in completed automatically (optional)
      // fetchOrders(tab); // still refresh to stay in sync (uncomment if needed)
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-8 min-h-[70vh] bg-gray-50">
        <h1 className="heading-2 mb-4">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab("pending")}
            className={`px-4 py-2 rounded transition-colors ${
              tab === "pending"
                ? "bg-blue-600 text-white"
                : "bg-white shadow border"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setTab("completed")}
            className={`px-4 py-2 rounded transition-colors ${
              tab === "completed"
                ? "bg-blue-600 text-white"
                : "bg-white shadow border"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Orders */}
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : !Array.isArray(orders) || orders.length === 0 ? (
          <p className="text-gray-600">No {tab} orders.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((o) => {
              const placed = new Date(o.date).toLocaleDateString();
              const isCompleted = o.status === "completed";
              const statusBadge = isCompleted
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-amber-100 text-amber-700 border-amber-200";
              const displayStatus = isCompleted
                ? "completed"
                : o.deliveryStatus || "pending";
              return (
                <div
                  key={o.id}
                  className="group border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Accent bar */}
                  <div
                    className={`h-1 w-full ${
                      o.status === "completed" ? "bg-green-500" : "bg-amber-400"
                    } opacity-80`}
                  ></div>
                  <div className="p-5 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h2 className="font-semibold text-lg tracking-tight flex items-center gap-2">
                          <span className="text-gray-800">Order #{o.id}</span>
                          {o.status === "completed" && (
                            <span className="text-[10px] uppercase tracking-wide font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                              Done
                            </span>
                          )}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <div>
                            Placed:{" "}
                            <span className="font-medium text-gray-600">
                              {placed}
                            </span>
                          </div>
                          <div>
                            Total Items:{" "}
                            <span className="font-medium text-gray-600">
                              {o.items.length}
                            </span>
                          </div>
                          {!isCompleted && o.estimatedDelivery && (
                            <div className="flex items-center gap-1">
                              ETA:{" "}
                              <span className="font-medium text-gray-600">
                                {new Date(
                                  o.estimatedDelivery
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 min-w-[140px]">
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full border ${statusBadge} capitalize`}
                        >
                          {displayStatus}
                        </span>
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-wide text-gray-400">
                            Total
                          </p>
                          <p className="text-xl font-semibold text-gray-800">
                            ${o.total}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="mt-1 border border-gray-100 rounded-lg overflow-hidden">
                      <div className="hidden md:grid grid-cols-12 bg-gray-50 text-[11px] font-medium text-gray-500 uppercase tracking-wide px-4 py-2">
                        <div className="col-span-5">Product</div>
                        <div className="col-span-3">Variant</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Subtotal</div>
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {o.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="grid grid-cols-12 px-4 py-2 text-sm md:items-center gap-2 md:gap-0"
                          >
                            <div className="col-span-12 md:col-span-5 font-medium text-gray-700 flex items-start">
                              <span className="line-clamp-2">
                                {item.product}
                              </span>
                            </div>
                            <div className="col-span-6 md:col-span-3 text-gray-500 text-xs md:text-sm">
                              {item.variant}
                            </div>
                            <div className="col-span-3 md:col-span-2 md:text-center text-gray-600 font-medium">
                              {item.qty}
                            </div>
                            <div className="col-span-3 md:col-span-2 text-right text-gray-700 font-semibold">
                              ${item.subtotal}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-1">
                      {tab === "pending" && (
                        <button
                          onClick={() => markCompleted(o.id)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 transition"
                        >
                          <span className="hidden sm:inline">
                            Mark as Received
                          </span>
                          <span className="sm:hidden">Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Orders;
