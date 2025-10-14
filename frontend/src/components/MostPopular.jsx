import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

const MostPopular = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMostPopularProducts = async () => {
      try {
        const response = await fetch("http://localhost:9000/api/mostpopular");
        if (!response.ok) {
          throw new Error("Failed to fetch most popular products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMostPopularProducts();
  }, []);

  if (loading) {
    return (
      <p className="text-center text-gray-500">
        Loading most popular products...
      </p>
    );
  }

  if (error) {
    return <p className="text-center text-orange-600">{error}</p>;
  }

  return (
    <div className="py-2 px-6">
      <div className="flex flex-col items-start px-10 md:px-16 lg:px-50">
        <div className="flex flex-col items-end pt-12 py-10">
          <p className="text-2xl font-medium">Most Popular Products</p>
          <div className="w-20 h-0.5 bg-orange-600 rounded-full"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.Product_ID} product={product} />
        ))}
      </div>
    </div>
  );
};

export default MostPopular;
