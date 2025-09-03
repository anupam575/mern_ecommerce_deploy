import React, { useState } from "react";
import axios from "axios";
import "./style/CreateProduct.css";

// 🔹 Initial state outside component
const initialProductData = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  image: null,
};

export default function CreateProduct() {
  const [productData, setProductData] = useState(initialProductData);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Form fields for map()
  const formFields = [
    { name: "name", label: "Product Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "price", label: "Price", type: "number", required: true },
    { name: "category", label: "Category", type: "text", required: true },
    { name: "stock", label: "Stock", type: "number", required: true },
  ];

  // Handle text/number inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProductData((prev) => ({ ...prev, image: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productData.image) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key === "image") {
        formData.append("file", productData.image);
      } else {
        formData.append(key, productData[key]);
      }
    });

    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/admin/product/new`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      alert("✅ Product created successfully");
      setProductData(initialProductData);
      setPreview(null);
    } catch (error) {
      console.error("❌ Error creating product:", error.response?.data || error.message);
      alert("❌ Error creating product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-product-container">
      <h2>Create New Product</h2>

      <form onSubmit={handleSubmit} className="create-product-form">
        {formFields.map((field) => (
          <div key={field.name} className="form-group">
            <label htmlFor={field.name}>{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                value={productData[field.name]}
                onChange={handleChange}
                placeholder={`Enter ${field.label}`}
                required={field.required}
              />
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={productData[field.name]}
                onChange={handleChange}
                placeholder={`Enter ${field.label}`}
                required={field.required}
              />
            )}
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="file">Product Image</label>
          <input
            type="file"
            id="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>

        {preview && <img src={preview} alt="Preview" className="preview-image" />}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
