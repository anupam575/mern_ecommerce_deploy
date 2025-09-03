import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./style/ProductDetails.css";
import ReviewSection from "./ReviewSection";

import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/product/${id}`,
        { withCredentials: true }
      );
      setProduct(data.product);
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("❌ Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      id: product._id,
      title: product.name,
      price: product.price,
      img: product.images[0]?.url || "#",
      cartId: uuidv4(),
    };

    dispatch(addToCart(cartItem));
    toast.success("🛒 Product added to cart!");
  };

  if (loading)
    return (
      <div className="loading-placeholder">
        <p>Loading product details...</p>
      </div>
    );

  if (!product) return <p>Product not found.</p>;

  return (
    <>
      <div className="amazon-product-container">
        <div className="amazon-product-left">
          <img
            src={product.images[0]?.url || "#"}
            alt={product.name}
            className="amazon-product-image"
          />
        </div>

        <div className="amazon-product-right">
          <h2 className="amazon-product-title">{product.name}</h2>
          <p className="amazon-product-description">{product.description}</p>
          <p className="amazon-product-rating">
            ⭐ {product.ratings} ({product.numOfReviews} reviews)
          </p>
          <p className="amazon-product-price">₹{product.price}</p>

          <p
            className={`amazon-product-stock ${
              product.Stock > 0 ? "in-stock" : "out-of-stock"
            }`}
          >
            {product.Stock > 0 ? "In Stock" : "Out of Stock"}
          </p>

          <div className="amazon-product-actions">
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              aria-label="Add product to cart"
            >
              Add to Cart
            </button>
            <button className="buy-now-btn" aria-label="Buy this product now">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* ⭐ Review Section */}
      <ReviewSection
        productId={product._id}
        user={loggedInUser}
        onReviewSubmit={fetchProductDetails}
      />
    </>
  );
}
