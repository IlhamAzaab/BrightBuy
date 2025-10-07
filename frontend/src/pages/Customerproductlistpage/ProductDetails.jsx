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

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9000";
  const { user } = useContext(AuthContext);

  const normalize = (s) => (s || "").replace(/\\/g, "/");

  useEffect(() => {
    fetch(`${API_BASE}/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        // pick the first variant by Variant_ID (your query already orders asc)
        const first = data?.Variants?.[0] ?? null;
        setSelectedVariant(first);
      })
      .catch(() => {
        setProduct(null);
        setSelectedVariant(null);
      });
  }, [id, API_BASE]);

  const prices = useMemo(() => {
    const arr = (product?.Variants ?? [])
      .map((v) => Number(v.Price))
      .filter((n) => !Number.isNaN(n));
    if (!arr.length) return null;
    return { min: Math.min(...arr), max: Math.max(...arr) };
  }, [product]);

  const priceFormat = (n) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  // Choose which image to show:
  // 1) selected variant image, 2) first variant image, 3) (legacy) product image (if any)
  const mainImagePath =
    selectedVariant?.Image_URL ||
    product?.Variants?.[0]?.Image_URL ||
    product?.Image_URL ||
    "";

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");
    if ((product.Variants?.length ?? 0) > 1 && !selectedVariant) {
      alert("Please choose a variant first");
      return; // Don't navigate to cart if no variant selected
    }
    const variantId =
      selectedVariant?.Variant_ID ?? product.Variants?.[0]?.Variant_ID ?? null;

    try {
      await axios.post(`${API_BASE}/api/cart/add`, { variantId, qty: 1 });
      // Only navigate to cart if the item was successfully added
      navigate("/cart");
    } catch (e) {
      alert(e.response?.data?.error || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!user) return navigate("/login");
    await handleAddToCart();
    navigate("/checkout");
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
      <div className="md:px-1 lg:px-32 py-5 grid lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="bg-gray-100 rounded-xl p-2 flex items-center justify-center">
          <img
            src={`${API_BASE}${normalize(mainImagePath)}`}
            alt={product.Product_Name}
            className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
          />

        </div>

        {/* Details */}
        <div className="py-10">
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
                    {v.Colour ?? "Default"} {v.Size ? `· ${v.Size}GB` : ""} {" · "}
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