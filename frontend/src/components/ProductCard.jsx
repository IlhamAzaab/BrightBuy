import React from "react";

export default function ProductCard({product}){
    const price_format = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
    const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

    return(
        <div className="product_card">
            <img src={`${API_BASE}${product.Image_URL}`} alt={product.Product_Name} />
            <h2>{product.Product_Name}</h2>
            <p>{product.Brand}</p>
            {
                (product.Variants ?? []).map(v =>(
                    <div key={v.Variant_ID}>
                        <span>{v.Colour} - {v.Size}GB</span>
                        <span>{price_format.format(v.Price)}</span>
                        
                    </div>
                ))
            }

        </div>

    );
}