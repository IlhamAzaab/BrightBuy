import React, { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer"


export default function CustomerProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text() || res.statusText);
        return res.json();
      })
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to load products:", err);
        setProducts([]);
      });
  }, []);

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
        <div className="flex flex-col items-end pt-12">
          <p className="text-2xl font-medium">All products</p>
          <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-12 pb-14 w-full">
          {products.map((p) => (
            <ProductCard key={p.Product_ID} product={p} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}




 