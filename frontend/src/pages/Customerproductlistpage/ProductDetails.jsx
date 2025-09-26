import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9000";

  useEffect(() => {
    fetch(`${API_BASE}/api/products/${id}`)
      .then(r => r.json())
      .then(setProduct)
      .catch(() => setProduct(null));
  }, [id, API_BASE]);

  const prices = useMemo(() => {
    const arr = (product?.Variants ?? [])
      .map(v => Number(v.Price))
      .filter(n => !Number.isNaN(n));
    if (!arr.length) return null;
    const min = Math.min(...arr), max = Math.max(...arr);
    return { min, max };
  }, [product]);

  const priceFormat = (n) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const [selectedVariant, setSelectedVariant] = useState(null);

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
 
        <div className="bg-gray-100 rounded-xl p-6 flex items-center justify-center">
          <img
            src={`${API_BASE}${product.Image_URL || ""}`}
            alt={product.Product_Name}
            className="object-contain max-h-[480px] w-full"
          />
        </div>

      
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


          {!!(product.Variants?.length) && (
            <div className="mt-6 space-y-3">
              <div className="text-sm font-medium">Choose a variant</div>
              <div className="flex flex-wrap gap-2">
                {product.Variants.map(v => (
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
                    {v.Colour ?? "Default"} {v.Size ? `· ${v.Size}GB` : ""}
                    {" · "}
                    {priceFormat(Number(v.Price))}
                  </button>
                ))}
              </div>
            </div>
          )}

          
          <div className="mt-8 flex gap-3">
            <button
              className="px-5 py-3 rounded-md border"
              onClick={() => {
                // example cart add (localStorage). Replace with API if you have one.
                const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                cart.push({
                  Product_ID: product.Product_ID,
                  Variant_ID: selectedVariant?.Variant_ID ?? null,
                  qty: 1,
                });
                localStorage.setItem("cart", JSON.stringify(cart));
                alert("Added to cart");
              }}
            >
              Add to Cart
            </button>
            <button
              className="px-5 py-3 rounded-md bg-orange-600 text-white"
              onClick={() => {
                // Require a variant if multiple exist
                if ((product.Variants?.length ?? 0) > 1 && !selectedVariant) {
                  alert("Please choose a variant first");
                  return;
                }
                // Navigate to checkout and pass selection
                navigate("/checkout", {
                  state: {
                    items: [
                      {
                        Product_ID: product.Product_ID,
                        Variant_ID: selectedVariant?.Variant_ID ?? product.Variants?.[0]?.Variant_ID ?? null,
                        qty: 1,
                      },
                    ],
                  },
                });
              }}
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
