import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = (process.env.REACT_APP_API_BASE || "http://localhost:9000") + "";

const resolveImageUrl = (u) => {
  if (!u) return null;
  const clean = String(u).trim().replace(/\\/g, "/");
  if (/^https?:\/\//i.test(clean)) return clean;
  const path = clean.startsWith("/") ? clean : `/${clean}`;
  return `${API}${path}`;
};

export default function OutOfStockList() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/api/admin/outofstock`);
        setRows(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load out-of-stock products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const handleRowClick = (productId) => {
    navigate(`/admin/productlist`, { state: { scrollTo: productId } });
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white border border-gray-300 rounded-lg shadow">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-100 border-b border-gray-300 rounded-t-lg">
          <h2 className="text-lg font-semibold">Out of Stock Products</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-orange-600 text-white px-3 py-1 hover:bg-orange-700 transition rounded-full"
          >
            ← Back
          </button>
        </div>

        {/* Table */}
        {rows.length === 0 ? (
          <div className="p-6 text-gray-500">All products are in stock!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Variant</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) =>
                  p.variants.map((v, i) => (
                    <tr
                      key={v.Variant_ID}
                      className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => handleRowClick(p.Product_ID)}
                    >
                      <td className="px-4 py-3 flex items-center gap-3">
                        {i === 0 && v.Image_URL && (
                          <img
                            src={resolveImageUrl(v.Image_URL)}
                            alt="Product"
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                          />
                        )}
                        <span className="font-medium">{p.Product_Name}</span>
                      </td>
                      <td className="px-4 py-3">
                        {(v.Colour || "—") + (v.Size ? ` • ${v.Size}` : "")}
                      </td>
                      <td className="px-4 py-3 text-center text-red-600">{v.Stock_quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
