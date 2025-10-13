import React, { useEffect, useState } from "react";

export default function CategoryWiseOrders() {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9000";
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const token = 
          localStorage.getItem("token") || 
          sessionStorage.getItem("token");

        const res = await fetch(`${API_BASE}/api/reports/category`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setCategories(data.data);
      } catch (e) {
        console.error(e);
        //alert("Failed to load category orders report");
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, [API_BASE]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">
        Category-wise Order Report
      </h1>

      <div className="overflow-x-auto bg-white rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-3 py-2">Category Name</th>
              <th className="px-3 py-2">Total Orders</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-4 text-gray-500" colSpan={2}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && categories.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-gray-500" colSpan={2}>
                  No orders found.
                </td>
              </tr>
            )}
            {categories.map((category) => (
              <tr key={category.categoryName} className="border-t">
                <td className="px-3 py-2">{category.categoryName}</td>
                <td className="px-3 py-2">{category.orderCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}