import React, { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";
import './CustomerProductList.css'

export default function CustomerProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setProducts([]);
      });
  }, []);

  return (
    <div className="customer_product_list_grid">
      {products.map((p) => (
        <ProductCard key={p.Product_ID} product={p} />
      ))}
    </div>
  );
}
