import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function AdminProductsPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/admin/products`,
          {
            withCredentials: true, // cookies will be sent automatically
          }
        );
        setProducts(response.data.products);
      } catch (err) {
        console.error("❌ Error loading products:", err);
        if (err.response?.status === 401) {
          setError("Session expired or unauthorized. Please login.");
          // Optionally redirect to login
          navigate("/login");
        } else {
          setError("Error loading products");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProducts();
  }, [navigate]);

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      {/* Top Buttons */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <Link
          to="/dashboard"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "16px",
            marginRight: "10px",
          }}
        >
          ⬅️ Back to Dashboard
        </Link>
        <Link
          to="/admin/product/delete"
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          🗑 Delete Products
        </Link>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        🛒 Admin Products Panel
      </h2>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading...</p>
      ) : error ? (
        <p style={{ textAlign: "center", color: "red" }}>{error}</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <p>Total Products: {products.length}</p>
          <table
            border="1"
            cellPadding="10"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              minWidth: "600px",
            }}
          >
            <thead style={{ backgroundColor: "#eee" }}>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price (₹)</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod._id}>
                  <td>{prod._id}</td>
                  <td>{prod.name}</td>
                  <td>{prod.price}</td>
                  <td>{prod.stock}</td>
                  <td>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <Link
                        to={`/admin/product/${prod._id}/update`}
                        style={{
                          backgroundColor: "#28a745",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                      >
                        ✏️ Edit
                      </Link>
                      <Link
                        to="/admin/product/delete"
                        style={{
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                      >
                        🗑 Delete
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminProductsPanel;
