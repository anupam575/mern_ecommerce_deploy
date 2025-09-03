import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./style/UpdateProduct.css";

// 🔹 Initial state outside component
const initialProductData = {
  name: "",
  description: "",
  price: "",
  stock: "",
  file: null,
};

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userRedux = useSelector((state) => state.auth.user);

  const [productData, setProductData] = useState(initialProductData);
  const [oldImage, setOldImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Form fields definition for map()
  const formFields = [
    { name: "name", label: "Product Name", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "price", label: "Price", type: "number" },
    { name: "stock", label: "Stock", type: "number" },
  ];

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/product/${id}`,
          { withCredentials: true }
        );
        const prod = data.product;
        setProductData((prev) => ({
          ...prev,
          name: prod.name,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          file: null,
        }));
        setOldImage(prod.images[0]?.url || null);
      } catch (err) {
        console.error("Error loading product:", err);
        alert("❌ Error loading product");
      }
    };
    fetchProduct();
  }, [id]);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  // File change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProductData((prev) => ({ ...prev, file }));

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setNewImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const formData = new FormData();
      Object.keys(productData).forEach((key) => {
        if (key === "file" && productData.file) {
          formData.append("file", productData.file);
        } else {
          formData.append(key, productData[key]);
        }
      });

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/admin/product/${id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("✅ Product updated successfully");
      navigate("/admin/products");
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      alert("❌ Error updating product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-product-container">
      <h2 className="update-heading">✏️ Update Product</h2>
      <form onSubmit={handleSubmit} className="update-form">
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
                required
              />
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={productData[field.name]}
                onChange={handleChange}
                placeholder={`Enter ${field.label}`}
                required
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
            className="form-file"
          />
        </div>

        <div className="image-preview">
          {newImagePreview ? (
            <img src={newImagePreview} alt="New Preview" className="preview-img" />
          ) : oldImage ? (
            <img src={oldImage} alt="Old Preview" className="preview-img" />
          ) : null}
        </div>

        <button type="submit" className="update-button" disabled={loading}>
          {loading ? "Updating..." : "🔄 Update Product"}
        </button>
      </form>
    </div>
  );
};

export default UpdateProduct;
