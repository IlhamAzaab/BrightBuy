import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function CustomerProductList() {
  const [products, setProducts] = useState([]);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9000";
  const normalize = (s) => (s || "").replace(/\\/g, "/");

  const getColsForWidth = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1440;
    if (w >= 1280) return 5;
    if (w >= 1024) return 4;
    if (w >= 768) return 3;
    return 2;
    
  };

  const [cols, setCols] = useState(() =>
    typeof window !== "undefined" ? getColsForWidth() : 5
  );
  const [page, setPage] = useState(1);

  // Fisher–Yates shuffle (unbiased)
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.text()) || res.statusText);
        return res.json();
      })
      .then((data) => {
        const list = (Array.isArray(data) ? data : []).map((p) => {
          const firstVarImg = p?.Variants?.[0]?.Image_URL || null;
          return {
            ...p,
            
            Image_URL: firstVarImg ? normalize(firstVarImg) : p.Image_URL,
          };
        });

        // Jumble order
        const randomized = shuffle([...list]);
        setProducts(randomized);
        setPage(1); 
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setProducts([]);
      });
  }, [API_BASE]);

  useEffect(() => {
    const onResize = () => setCols(getColsForWidth());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const itemsPerPage = cols * 4;
  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [products, page, itemsPerPage]);

  const goToPage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
        <div className="flex flex-col items-end pt-12">
          <p className="text-2xl font-medium">All products</p>
          <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-12 w-full">
          {pageItems.length === 0 ? (
            <p className="col-span-full text-sm text-gray-500">No products to show.</p>
          ) : (
            pageItems.map((p) => <ProductCard key={p.Product_ID} product={p} />)
          )}
        </div>

        <div className="w-full flex justify-center items-center gap-2 mt-10 pb-14">
          <button
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded border text-sm disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => goToPage(num)}
              className={`px-3 py-1.5 rounded border text-sm ${
                page === num ? "bg-orange-600 text-white border-green-600" : "hover:bg-slate-50"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded border text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
