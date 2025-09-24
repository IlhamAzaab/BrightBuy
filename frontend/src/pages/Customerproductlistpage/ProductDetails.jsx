import React, { useEffect, useMemo, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Base URL for the backend API
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9000";

  // Current logged-in user (null if not logged in)
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Load single product (with its Variants) from backend
    fetch(`${API_BASE}/api/products/${id}`)
      .then((r) => r.json())
      .then(setProduct)
      .catch(() => setProduct(null));
  }, [id, API_BASE]);

  const prices = useMemo(() => {
    // Compute min/max price from variants
    const arr = (product?.Variants ?? [])
      .map((v) => Number(v.Price))
      .filter((n) => !Number.isNaN(n));
    if (!arr.length) return null;
    const min = Math.min(...arr),
      max = Math.max(...arr);
    return { min, max };
  }, [product]);

  const priceFormat = (n) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  // Add the selected variant to the user's cart on the server (or redirect to login)
  const handleAddToCart = async () => {
    // If not logged in, send to login page
    if (!user) {
      navigate("/login");
      return;
    }
    // If there are multiple variants, require a choice
    if ((product.Variants?.length ?? 0) > 1 && !selectedVariant) {
      alert("Please choose a variant first");
      return;
    }
    // Prefer the selected variant; otherwise use the first available one
    const variantId =
      selectedVariant?.Variant_ID ?? product.Variants?.[0]?.Variant_ID ?? null;

    try {
      // Call backend to add variant to the user's cart (JWT is auto-set by AuthProvider)
      await axios.post(`${API_BASE}/api/cart/add`, { variantId, qty: 1 });
      alert("Added to cart");
    } catch (e) {
      alert(e.response?.data?.error || "Failed to add to cart");
    }
  };

  // Add to cart then navigate to checkout (requires login)
  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    await handleAddToCart(); // Ensure item exists in server cart
    navigate("/checkout");   // Go to checkout page
  };

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-12">Loading…</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-12 grid lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="bg-gray-100 rounded-xl p-6 flex items-center justify-center">
          <img
            src={`${API_BASE}${product.Image_URL || ""}`}
            alt={product.Product_Name}
            className="object-contain max-h-[480px] w-full"
          />
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-semibold">{product.Product_Name}</h1>

          <div className="mt-3 text-sm text-gray-600 leading-6">
            {product.Description}
          </div>

          <div className="mt-6">
            <div className="text-2xl font-semibold">
              {prices
                ? prices.min === prices.max
                  ? priceFormat(prices.min)
                  : `${priceFormat(prices.min)} – ${priceFormat(prices.max)}`
                : "—"}
            </div>
            <div className="mt-2 text-sm text-gray-500">Brand: {product.Brand}</div>
          </div>

          {/* Variant selector */}
          {!!(product.Variants?.length) && (
            <div className="mt-6 space-y-3">
              <div className="text-sm font-medium">Choose a variant</div>
              <div className="flex flex-wrap gap-2">
                {product.Variants.map((v) => (
                  <button
                    key={v.Variant_ID}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-2 rounded border text-sm ${
                      selectedVariant?.Variant_ID === v.Variant_ID
                        ? "bg-orange-600 text-white border-orange-600"
                        : "hover:bg-slate-50"
                    }`}
                    title={`${v.Colour ?? "—"} ${v.Size ? `• ${v.Size}GB` : ""}`}
                  >
                    {v.Colour ?? "Default"} {v.Size ? `· ${v.Size}GB` : ""}{" "}
                    {" · "}
                    {priceFormat(Number(v.Price))}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button className="px-5 py-3 rounded-md border" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button
              className="px-5 py-3 rounded-md bg-orange-600 text-white"
              onClick={handleBuyNow}
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
