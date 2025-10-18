import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  // Product fields
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");

  // Variant fields
  const [variantCount, setVariantCount] = useState(1);
  const [variants, setVariants] = useState([
    { price: "", stockQuantity: "", size: "", colour: "", image: null },
  ]);

  // Success badge state
  const [showBadge, setShowBadge] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetch("http://localhost:9000/api/addproduct/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setCategoryId("");
      })
      .catch((err) => console.error("Error fetching categories:", err));
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
      updated.push({
        price: "",
        stockQuantity: "",
        size: "",
        colour: "",
        image: null,
      });
    }
    while (updated.length > count) {
      updated.pop();
    }
    setVariants(updated);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate variants before submitting
    for (let i = 0; i < variantCount; i++) {
      const variant = variants[i];
      if (
        !variant.price ||
        !variant.stockQuantity ||
        !variant.colour ||
        !variant.image
      ) {
        alert(`Please fill all required fields for variant ${i + 1}`);
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

    variants.forEach((v) => {
      formData.append("price", v.price);
      formData.append("stockQuantity", v.stockQuantity);
      formData.append("size", v.size || "");
      formData.append("colour", v.colour);
      formData.append("variantImages", v.image);
    });

    try {
      const res = await fetch("http://localhost:9000/api/addproduct", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        // ✅ Show success badge
        setShowBadge(true);
        setTimeout(() => setShowBadge(false), 3000);

        // ✅ Reset form fields
        setCategoryId("");
        setProductName("");
        setBrand("");
        setSku("");
        setDescription("");
        setVariantCount(1);
        setVariants([
          { price: "", stockQuantity: "", size: "", colour: "", image: null },
        ]);
      } else {
        alert(data.error || "Something went wrong!");
        setShowBadge(false);
      }
    } catch (err) {
      console.error(err);
      alert("Server error!");
      setShowBadge(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
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
                    Product Added Successfully!
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

      <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Add New Product
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Variant Count
            </label>
            <input
              type="number"
              min={1}
              value={variantCount}
              onChange={handleVariantCountChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {variants.map((v, idx) => (
            <div
              key={idx}
              className="border border-gray-300 p-4 rounded-md mb-4"
            >
              <h3 className="font-medium text-gray-800 mb-4">
                Variant {idx + 1}
              </h3>
              <input
                type="number"
                placeholder="Price"
                value={v.price}
                onChange={(e) =>
                  handleVariantChange(idx, "price", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                value={v.stockQuantity}
                onChange={(e) =>
                  handleVariantChange(idx, "stockQuantity", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <input
                type="number"
                placeholder="Size"
                value={v.size}
                onChange={(e) =>
                  handleVariantChange(idx, "size", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <input
                type="text"
                placeholder="Colour"
                value={v.colour}
                onChange={(e) =>
                  handleVariantChange(idx, "colour", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleVariantChange(idx, "image", e.target.files[0])
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full p-3 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
