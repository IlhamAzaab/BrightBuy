import React, { useState, useEffect } from "react";

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  // Product fields
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");

  // Variant fields
  const [variantCount, setVariantCount] = useState(1); // Added
  const [variants, setVariants] = useState([
    { price: "", stockQuantity: "", size: "", colour: "", image: null },
  ]);

  // Fetch categories
  useEffect(() => {
    fetch("http://localhost:9000/api/addproduct/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setCategoryId(""); // keep placeholder selected
      });
  }, []);

  // Handle variant input change
  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  // Update variant count dynamically
  const handleVariantCountChange = (e) => {
    let count = parseInt(e.target.value);
    setVariantCount(count);

    const updated = [...variants];
    while (updated.length < count) {
      updated.push({ price: "", stockQuantity: "", size: "", colour: "", image: null });
    }
    while (updated.length > count) {
      updated.pop();
    }
    setVariants(updated);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all variant images
    for (let i = 0; i < variantCount; i++) {
      if (!variants[i].image) {
        alert(`Please upload an image for variant ${i + 1}`);
        return;
      }
    }

    const formData = new FormData();
    formData.append("categoryId", categoryId);
    formData.append("productName", productName);
    formData.append("brand", brand);
    formData.append("sku", sku);
    formData.append("description", description);
    formData.append("variantCount", variantCount);

    // Append variant arrays
    variants.forEach((v, i) => {
      formData.append("price", v.price);
      formData.append("stockQuantity", v.stockQuantity);
      formData.append("size", v.size);
      formData.append("colour", v.colour);
      formData.append("variantImages", v.image); // match backend name
    });

    try {
      const res = await fetch("http://localhost:9000/api/addproduct", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert("Product and variants added successfully");
        // reset all
        setCategoryId("");
        setProductName("");
        setBrand("");
        setSku("");
        setDescription("");
        setVariantCount(1);
        setVariants([{ price: "", stockQuantity: "", size: "", colour: "", image: null }]);
      } else {
        alert(data.error || "Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      alert("Server error!");
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-center items-center p-4">
      <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-lg">

        {/* Category */}
        <div>
          <label className="block font-medium mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">-Select Category-</option>
            {categories.map((cat) => (
              <option key={cat.Category_ID} value={cat.Category_ID}>
                {cat.Category_Name}
              </option>
            ))}
          </select>
        </div>

        {/* Product info */}
        <div>
          <label>Product Name</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label>Brand</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label>SKU</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Variant count */}
        <div>
          <label>Variant Count</label>
          <input
            type="number"
            min={1}
            value={variantCount}
            onChange={handleVariantCountChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Variant forms */}
        {variants.map((v, idx) => (
          <div key={idx} className="border p-3 rounded mb-3">
            <h3 className="font-medium mb-2">Variant {idx + 1}</h3>
            <input
              type="number"
              placeholder="Price"
              value={v.price}
              onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="number"
              placeholder="Stock Quantity"
              value={v.stockQuantity}
              onChange={(e) => handleVariantChange(idx, "stockQuantity", e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="number"
              placeholder="Size"
              value={v.size}
              onChange={(e) => handleVariantChange(idx, "size", e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Colour"
              value={v.colour}
              onChange={(e) => handleVariantChange(idx, "colour", e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleVariantChange(idx, "image", e.target.files[0])}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}

        <button type="submit" className="w-full p-3 bg-orange-600 text-white rounded">
          ADD PRODUCT
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
