import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const priceFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9000";

  // Prices from variants (DECIMAL(10,2) → Number)
  const prices = (product.Variants ?? []).map((v) => Number(v.Price)).filter((n) => !Number.isNaN(n));

  const min = prices.length ? Math.min(...prices) : null;
  const max = prices.length ? Math.max(...prices) : null;

  const priceLabel =
    min == null ? "—" : min === max ? priceFormat.format(min) : `${priceFormat.format(min)} - ${priceFormat.format(max)}`;


  const staticRating = 4.5;
  const detailsPath = `/products/${product.Product_ID}`;

  return (
    <div className="flex flex-col items-start gap-1 max-w-[220px] w-full">
      <Link to={detailsPath} className="group relative bg-gray-100 rounded-lg w-full h-52 flex items-center justify-center overflow-hidden">
        <img
          src={`${API_BASE}${product.Image_URL || ""}`}
          alt={product.Product_Name}
          className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
          loading="lazy"
        />
      </Link>

      <Link to={detailsPath} className="md:text-base font-medium pt-2 w-full truncate">
        {product.SKU}
      </Link>
      <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">{product.Description}</p>

      <div className="flex items-center gap-2">
        <p className="text-xs">4.5</p>
        <div className="flex items-center gap-0.5 text-yellow-500 text-xs">
          {Array.from({ length: 5 }).map((_, i) => <span key={i}>{i < 4 ? "★" : "☆"}</span>)}
        </div>
      </div>

      <div className="flex items-end justify-between w-full mt-1">
        <p className="text-base font-medium">{priceLabel}</p>
        <button
          onClick={(e) => {
            e.preventDefault();           
            navigate(detailsPath);        
          }}
          className="max-sm:hidden px-4 py-1.5 text-gray-600 border border-gray-300 rounded-full text-xs hover:bg-slate-50 transition"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}

