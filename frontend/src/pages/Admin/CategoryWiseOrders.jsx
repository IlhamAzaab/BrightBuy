import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function CategoryWiseOrders() {
  const { token, user } = useContext(AuthContext);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9000";
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if user is authenticated and is admin
        if (!token || !user) {
          setError("Please log in to view this report");
          setLoading(false);
          return;
        }

        if (user.role !== 'admin') {
          setError("Admin access required");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/reports/category`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("API Error:", res.status, errorText);
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        
        const data = await res.json();
        console.log("Category data received:", data);
        setCategories(data.data || []);
      } catch (e) {
        console.error("Error loading categories:", e);
        setError(e.message || "Failed to load category report");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, [token, user, API_BASE]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">
        Category-wise Order Report
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

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
            {!loading && !error && categories.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-gray-500" colSpan={2}>
                  No orders found.
                </td>
              </tr>
            )}
            {!loading && !error && categories.map((category) => (
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