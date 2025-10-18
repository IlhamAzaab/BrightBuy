import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const API = (process.env.REACT_APP_API_BASE || "http://localhost:9000") + "";

// normalize and prefix with API if needed
const resolveImageUrl = (u) => {
  if (!u) return null;
  const clean = String(u).trim().replace(/\\/g, "/");
  if (/^https?:\/\//i.test(clean)) return clean;
  const path = clean.startsWith("/") ? clean : `/${clean}`;
  return `${API}${path}`;
};

function Spinner() {
  return <div className="p-6 text-gray-500">Loading…</div>;
}

function IconBtn({ onClick, disabled, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-1 border rounded-md text-sm ${
        disabled
          ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
          : "bg-white border-gray-300 text-gray-900 cursor-pointer"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminProductList() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState({});
  const [dirty, setDirty] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo && rows.length > 0) {
      const id = location.state.scrollTo;
      setOpen((o) => ({ ...o, [id]: true }));
      const el = document.getElementById(`product-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, rows, navigate]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/admin/products`);
        setRows(res.data || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dirtyCount = useMemo(() => Object.keys(dirty).length, [dirty]);

  const markDirty = (variantId, patch) => {
    setDirty((prev) => ({ ...prev, [variantId]: { ...prev[variantId], ...patch } }));
  };

  const adjust = (variant, field, delta) => {
    const base =
      dirty[variant.Variant_ID]?.[field] ??
      (field === "price" ? Number(variant.Price) : Number(variant.Stock_quantity));

    let next = Number(base) + Number(delta);
    if (field === "price") next = Math.max(0, Number(next.toFixed(2)));
    else next = Math.max(0, Math.round(next));

    markDirty(variant.Variant_ID, { [field]: next });
  };

  const displayValue = (variant, field) => {
    const v = dirty[variant.Variant_ID]?.[field];
    if (v !== undefined) return v;
    return field === "price" ? Number(variant.Price) : Number(variant.Stock_quantity);
  };

  const handleRemoveProduct = async (productId) => {
    if (!window.confirm("Remove this product and all its variants?")) return;
    try {
      await axios.delete(`${API}/api/admin/products/${productId}`);
      setRows((r) => r.filter((p) => p.Product_ID !== productId));
      setDirty((prev) => {
        const next = { ...prev };
        const prod = rows.find((p) => p.Product_ID === productId);
        prod?.variants?.forEach((v) => delete next[v.Variant_ID]);
        return next;
      });
    } catch (e) {
      console.error(e);
      alert("Failed to remove product.");
    }
  };

  const saveChanges = async () => {
    if (dirtyCount === 0) return;
    setSaving(true);
    setError("");
    try {
      const updates = Object.entries(dirty).map(([variantId, data]) => ({
        variantId: Number(variantId),
        price: data.price,
        stock: data.stock,
      }));
      await axios.patch(`${API}/api/admin/variants/bulk`, { updates });

      setRows((prev) =>
        prev.map((p) => ({
          ...p,
          variants: p.variants.map((v) => {
            const d = dirty[v.Variant_ID];
            if (!d) return v;
            return {
              ...v,
              Price: d.price !== undefined ? d.price : v.Price,
              Stock_quantity: d.stock !== undefined ? d.stock : v.Stock_quantity,
            };
          }),
        }))
      );
      setDirty({});
    } catch (e) {
      console.error(e);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen p-4 flex justify-center bg-gray-50">
      <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center gap-5">
            <h2 className="text-lg font-semibold">All Products</h2>
            <button
              onClick={() => navigate("/admin/outofstocklist")}
              className="bg-orange-600 text-white px-3 py-1 rounded-full hover:bg-orange-700"
            >
              Out of stock Products
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {dirtyCount} change{dirtyCount === 1 ? "" : "s"}
            </span>
            <button
              onClick={saveChanges}
              disabled={dirtyCount === 0 || saving}
              className={`px-3 py-1 rounded-md text-white ${
                dirtyCount === 0 || saving ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <div className="p-3 text-red-700 border-b border-red-200">{error}</div>}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2 w-2/5">Product</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Remove</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const prices = p.variants.map((v) => Number(v.Price)).filter((n) => !Number.isNaN(n));
                const min = prices.length ? Math.min(...prices) : null;
                const max = prices.length ? Math.max(...prices) : null;
                const priceLabel =
                  min == null ? "—" : min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;

                const totalQty = p.variants.reduce(
                  (sum, v) => sum + (dirty[v.Variant_ID]?.stock ?? Number(v.Stock_quantity || 0)),
                  0
                );

                return (
                  <React.Fragment key={p.Product_ID}>
                    {/* Main product row */}
                    <tr
                      id={`product-${p.Product_ID}`}
                      className="border-t border-gray-200 bg-white"
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setOpen((o) => ({ ...o, [p.Product_ID]: !o[p.Product_ID] }))}
                            title={open[p.Product_ID] ? "Hide variants" : "Show variants"}
                            className="px-2 py-0.5 border rounded-md text-gray-600 hover:bg-gray-100"
                          >
                            {open[p.Product_ID] ? "▾" : "▸"}
                          </button>
                          {p.Image_URL && (
                            <img
                              src={resolveImageUrl(p.Image_URL)}
                              alt=""
                              className="w-12 h-12 object-cover rounded-md bg-gray-100"
                              onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                            />
                          )}
                          <span className="font-medium">{p.Product_Name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">{p.Category_ID}</td>
                      <td className="px-4 py-2">{priceLabel}</td>
                      <td className="px-4 py-2">{totalQty}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleRemoveProduct(p.Product_ID)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>

                    {/* Variant rows */}
                    {open[p.Product_ID] && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-4 py-2">
                          {p.variants.length === 0 ? (
                            <div className="text-gray-500">No variants.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead className="text-gray-700">
                                  <tr>
                                    <th className="py-1 text-left">Photo</th>
                                    <th className="py-1 text-left">Variant</th>
                                    <th className="py-1">Price</th>
                                    <th className="py-1">Quantity</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {p.variants.map((v) => (
                                    <tr key={v.Variant_ID} className="border-t border-gray-200">
                                      <td className="py-1">
                                        {v.Image_URL && (
                                          <img
                                            src={resolveImageUrl(v.Image_URL)}
                                            alt=""
                                            className="w-10 h-10 object-cover rounded-md bg-gray-100"
                                            onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                                          />
                                        )}
                                      </td>
                                      <td className="py-1">
                                        {(v.Colour || "—") + (v.Size ? ` • ${v.Size}` : "")}
                                      </td>
                                      <td className="py-1">
                                        <div className="inline-flex items-center gap-1">
                                          <IconBtn title="-1" onClick={() => adjust(v, "price", -1)}>−</IconBtn>
                                          <span className="w-16 text-center">${displayValue(v, "price").toFixed(2)}</span>
                                          <IconBtn title="+1" onClick={() => adjust(v, "price", +1)}>+</IconBtn>
                                          <IconBtn title="-0.10" onClick={() => adjust(v, "price", -0.1)}>-0.10</IconBtn>
                                          <IconBtn title="+0.10" onClick={() => adjust(v, "price", +0.1)}>+0.10</IconBtn>
                                        </div>
                                      </td>
                                      <td className="py-1">
                                        <div className="inline-flex items-center gap-1">
                                          <IconBtn title="-1" onClick={() => adjust(v, "stock", -1)}>−</IconBtn>
                                          <span className="w-12 text-center">{displayValue(v, "stock")}</span>
                                          <IconBtn title="+1" onClick={() => adjust(v, "stock", +1)}>+</IconBtn>
                                          <IconBtn title="-10" onClick={() => adjust(v, "stock", -10)}>-10</IconBtn>
                                          <IconBtn title="+10" onClick={() => adjust(v, "stock", +10)}>+10</IconBtn>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
