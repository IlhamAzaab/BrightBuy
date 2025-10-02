import React, { useState, useEffect } from "react";

const AddProduct = () => {
  // Categories from database
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  // Product table
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [files, setFiles] = useState([null, null, null, null]);

  // Variant table
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [size, setSize] = useState("");
  const [colour, setColour] = useState("");
  const [description, setDescription] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    fetch("http://localhost:9000/api/addproduct/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].Category_ID);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!files.some((file) => file)) {
      alert("Please select at least one image!");
      return;
    }

    const formData = new FormData();
    formData.append("categoryId", categoryId);
    formData.append("productName", productName);
    formData.append("brand", brand);
    formData.append("sku", sku);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stockQuantity", stockQuantity);
    formData.append("size", size);
    formData.append("colour", colour);

    files.forEach((file) => {
      if (file) formData.append("images", file);
    });

    try {
      const response = await fetch("http://localhost:9000/api/addproduct", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert("Product added successfully!");
        setCategoryId(categories.length > 0 ? categories[0].Category_ID : "");
        setProductName("");
        setBrand("");
        setSku("");
        setDescription("");
        setPrice("");
        setStockQuantity("");
        setSize("");
        setColour("");
        setFiles([null, null, null, null]);
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

        {/* Category (Dropdown) */}
        <div>
          <label className="block font-medium">Category</label>
          <select
            className="mt-2 w-full p-2 border rounded"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            {categories.map((cat) => (
              <option key={cat.Category_ID} value={cat.Category_ID}>
                {cat.Category_Name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Info */}
        <div>
          <label className="block font-medium">Product Name</label>
          <input
            type="text"
            placeholder="Product Name"
            className="mt-2 w-full p-2 border rounded"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Brand</label>
          <input
            type="text"
            placeholder="Brand"
            className="mt-2 w-full p-2 border rounded"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            placeholder="Product Description"
            className="mt-2 w-full p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block font-medium">SKU</label>
          <input
            type="text"
            placeholder="SKU"
            className="mt-2 w-full p-2 border rounded"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
        </div>

        {/* Variant Info */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block font-medium">Price</label>
            <input
              type="number"
              placeholder="Price"
              className="mt-2 w-full p-2 border rounded"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium">Stock Quantity</label>
            <input
              type="number"
              placeholder="Stock Quantity"
              className="mt-2 w-full p-2 border rounded"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block font-medium">Size</label>
            <input
              type="number"
              placeholder="Size"
              className="mt-2 w-full p-2 border rounded"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium">Colour</label>
            <input
              type="text"
              placeholder="Colour"
              className="mt-2 w-full p-2 border rounded"
              value={colour}
              onChange={(e) => setColour(e.target.value)}
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block font-medium">Product Images</label>
          <div className="flex gap-2 mt-2">
            {[...Array(4)].map((_, index) => (
              <label key={index} className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const updatedFiles = [...files];
                    updatedFiles[index] = e.target.files[0];
                    setFiles(updatedFiles);
                  }}
                />
                <div className="w-24 h-24 border flex items-center justify-center rounded">
                  {files[index] ? (
                    <img
                      src={URL.createObjectURL(files[index])}
                      alt="preview"
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400">Upload</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-4 w-full p-3 bg-orange-600 text-white font-medium rounded"
        >
          ADD PRODUCT
        </button>
      </form>
    </div>
  );
};

export default AddProduct;