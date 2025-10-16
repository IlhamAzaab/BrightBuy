import React, { useEffect, useMemo, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showBadge, setShowBadge] = useState(false);

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
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

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
      return;
    }

    const variantId =
      selectedVariant?.Variant_ID ?? product.Variants?.[0]?.Variant_ID;
    const qty = 1; // default 1 for now

    try {
      const res = await axios.post(
        `${API_BASE}/api/cart/add`,
        { variantId, qty },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setShowBadge(true);
        setTimeout(() => setShowBadge(false), 1000); // Hide badge after 3 seconds
        // Navigate after showing the badge
        setTimeout(() => navigate("/products"), 1000);
      }
    } catch (err) {
      console.error("Failed to add to cart", err);
      alert(err.response?.data?.error || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!user) return navigate("/login");
    setShowBadge(true);
    await handleAddToCart();
    setTimeout(() => setShowBadge(false), 1000);
    setTimeout(() => navigate("/products/cart"),1000);
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
      <div className="min-h-screen bg-gray-50 relative">
        {/* ✅ Success Badge Animation */}
        <AnimatePresence>
          {showBadge && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="fixed top-16 left-0 w-full flex justify-center z-50"
            >
              <div className="text-m tracking-wide text-green-700 bg-green-100 border-2 border-green-300 px-12 py-2 rounded-full shadow-xl">
                Added to cart successfully!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="md:px-1 lg:px-32 py-5 grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="bg-gray-100 rounded-xl p-2 flex items-center justify-center">
            <img
              src={
                mainImagePath?.startsWith("http")
                  ? mainImagePath
                  : `${API_BASE}${normalize(mainImagePath)}`
              }
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
              <div className="mt-2 text-sm text-gray-500">
                Brand: {product.Brand}
              </div>
            </div>

            {/* Variant selector */}
            {!!product.Variants?.length && (
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
                      title={`${v.Colour ?? "—"} ${
                        v.Size ? `• ${v.Size}GB` : ""
                      }`}
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
              <button
                className="px-5 py-3 rounded-md border"
                onClick={handleAddToCart}
              >
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
      </div>
    </>
  );
}
