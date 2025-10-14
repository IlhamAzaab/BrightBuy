import React, { useEffect, useState } from "react";

const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "-");

export default function DeliveryTimeEstimates() {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9000";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        const res = await fetch(`${API_BASE}/api/admin/reports/delivery-time`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });

        if (!res.ok) throw new Error(await res.text());
        setRows(await res.json());
      } catch (e) {
        console.error(e);
        alert("Failed to load pending delivery estimates");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_BASE]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">
        Pending Delivery Estimates
      </h1>

      <div className="overflow-x-auto bg-white rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-3 py-2">Delivery ID</th>
              <th className="px-3 py-2">Order ID</th>
              <th className="px-3 py-2">User ID</th>
              <th className="px-3 py-2">Estimated Delivery Date</th>
              <th className="px-3 py-2">Days Left</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-4 text-gray-500" colSpan={5}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-gray-500" colSpan={5}>
                  No pending deliveries.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const overdue = r.Is_Overdue === 1;
              return (
                <tr key={r.Delivery_ID} className="border-t">
                  <td className="px-3 py-2">{r.Delivery_ID}</td>
                  <td className="px-3 py-2">{r.Order_ID}</td>
                  <td className="px-3 py-2">{r.User_ID}</td>
                  <td className="px-3 py-2">
                    {fmt(r.Estimated_Delivery_Date)}
                  </td>
                  <td
                    className={`px-3 py-2 ${
                      overdue ? "text-red-600 font-semibold" : ""
                    }`}
                  >
                    {overdue ? "0" : r.Days_Left}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
