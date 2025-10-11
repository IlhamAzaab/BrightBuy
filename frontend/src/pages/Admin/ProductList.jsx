import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

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
  return <div style={{ padding: 24, color: "#6b7280" }}>Loading…</div>;
}

function IconBtn({ onClick, disabled, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "4px 8px",
        border: "1px solid #d1d5db",
        borderRadius: 6,
        background: disabled ? "#f3f4f6" : "#fff",
        color: disabled ? "#9ca3af" : "#111827",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function AdminProductList() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]); // [{ Product_ID,..., variants:[{... Image_URL }]}]
  const [open, setOpen] = useState({}); // { [productId]: bool }
  const [dirty, setDirty] = useState({}); // { [variantId]: { price?, stock? } }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    <div style={{ minHeight: "100vh", padding: 16, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(0,0,0,.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>All Product</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              {dirtyCount} change{dirtyCount === 1 ? "" : "s"}
            </span>
            <button
              onClick={saveChanges}
              disabled={dirtyCount === 0 || saving}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                color: "#fff",
                background: dirtyCount === 0 || saving ? "#9ca3af" : "#059669",
                cursor: dirtyCount === 0 || saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: "8px 16px", color: "#b91c1c", borderBottom: "1px solid #fee2e2" }}>
            {error}
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead style={{ background: "#f9fafb", textAlign: "left" }}>
              <tr>
                <th style={{ padding: "10px 16px", width: "40%" }}>Product</th>
                <th style={{ padding: "10px 16px" }}>Category</th>
                <th style={{ padding: "10px 16px" }}>Price</th>
                <th style={{ padding: "10px 16px" }}>Quantity</th>
                <th style={{ padding: "10px 16px" }}>Remove</th>
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
                    <tr style={{ borderTop: "1px solid #e5e7eb", background: "#fff" }}>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button
                            onClick={() =>
                              setOpen((o) => ({ ...o, [p.Product_ID]: !o[p.Product_ID] }))
                            }
                            style={{
                              padding: "2px 8px",
                              border: "1px solid #d1d5db",
                              borderRadius: 6,
                              background: "#fff",
                              cursor: "pointer",
                            }}
                            title={open[p.Product_ID] ? "Hide variants" : "Show variants"}
                          >
                            {open[p.Product_ID] ? "▾" : "▸"}
                          </button>

                          {p.Image_URL ? (
                            <img
                              src={resolveImageUrl(p.Image_URL)}
                              alt=""
                              style={{
                                width: 48,
                                height: 48,
                                objectFit: "cover",
                                borderRadius: 6,
                                background: "#f3f4f6",
                              }}
                              onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                            />
                          ) : null}

                          <span style={{ fontWeight: 600 }}>{p.Product_Name}</span>
                        </div>
                      </td>

                      <td style={{ padding: "10px 16px" }}>{p.Category_ID}</td>
                      <td style={{ padding: "10px 16px" }}>{priceLabel}</td>
                      <td style={{ padding: "10px 16px" }}>{totalQty}</td>

                      <td style={{ padding: "10px 16px" }}>
                        <button
                          onClick={() => handleRemoveProduct(p.Product_ID)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: "none",
                            background: "#dc2626",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>

                    {open[p.Product_ID] && (
                      <tr style={{ background: "#fafafa" }}>
                        <td colSpan={5} style={{ padding: "10px 16px" }}>
                          {p.variants.length === 0 ? (
                            <div style={{ color: "#6b7280" }}>No variants.</div>
                          ) : (
                            <div style={{ overflowX: "auto" }}>
                              <table style={{ width: "100%", fontSize: 13 }}>
                                <thead>
                                  <tr style={{ color: "#4b5563" }}>
                                    <th style={{ padding: "8px 0", textAlign: "left" }}>Photo</th>
                                    <th style={{ padding: "8px 0", textAlign: "left" }}>Variant</th>
                                    <th style={{ padding: "8px 0" }}>Price</th>
                                    <th style={{ padding: "8px 0" }}>Quantity</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {p.variants.map((v) => (
                                    <tr key={v.Variant_ID} style={{ borderTop: "1px solid #e5e7eb" }}>
                                      {/* Variant photo */}
                                      <td style={{ padding: "8px 10px" }}>
                                        {v.Image_URL ? (
                                          <img
                                            src={resolveImageUrl(v.Image_URL)}
                                            alt=""
                                            style={{
                                              width: 40,
                                              height: 40,
                                              objectFit: "cover",
                                              borderRadius: 6,
                                              background: "#f3f4f6",
                                            }}
                                            onError={(e) =>
                                              (e.currentTarget.style.visibility = "hidden")
                                            }
                                          />
                                        ) : null}
                                      </td>

                                      {/* Variant name */}
                                      <td style={{ padding: "8px 0" }}>
                                        {(v.Colour || "—") + (v.Size ? ` • ${v.Size}` : "")}
                                      </td>

                                      {/* Price controls */}
                                      <td style={{ padding: "8px 0" }}>
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                          <IconBtn title="-1" onClick={() => adjust(v, "price", -1)}>
                                            −
                                          </IconBtn>
                                          <span style={{ minWidth: 70, textAlign: "center" }}>
                                            ${displayValue(v, "price").toFixed(2)}
                                          </span>
                                          <IconBtn title="+1" onClick={() => adjust(v, "price", +1)}>
                                            +
                                          </IconBtn>
                                          <IconBtn title="-0.10" onClick={() => adjust(v, "price", -0.1)}>
                                            -0.10
                                          </IconBtn>
                                          <IconBtn title="+0.10" onClick={() => adjust(v, "price", +0.1)}>
                                            +0.10
                                          </IconBtn>
                                        </div>
                                      </td>

                                      {/* Stock controls */}
                                      <td style={{ padding: "8px 0" }}>
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                          <IconBtn title="-1" onClick={() => adjust(v, "stock", -1)}>
                                            −
                                          </IconBtn>
                                          <span style={{ minWidth: 48, textAlign: "center" }}>
                                            {displayValue(v, "stock")}
                                          </span>
                                          <IconBtn title="+1" onClick={() => adjust(v, "stock", +1)}>
                                            +
                                          </IconBtn>
                                          <IconBtn title="-10" onClick={() => adjust(v, "stock", -10)}>
                                            -10
                                          </IconBtn>
                                          <IconBtn title="+10" onClick={() => adjust(v, "stock", +10)}>
                                            +10
                                          </IconBtn>
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

