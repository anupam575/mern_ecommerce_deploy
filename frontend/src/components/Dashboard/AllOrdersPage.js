import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./AllOrdersPage.css"; // optional styling
import OrderStatusUpdater from "./OrderStatusUpdater";

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/admin/orders`,
        {
          withCredentials: true, // ✅ cookies sent automatically
        }
      );

      setOrders(data.orders);
      setTotalAmount(data.totalAmount);
      setLoading(false);
    } catch (err) {
      console.error("❌ Failed to fetch orders:", err);
      setLoading(false);

      if (err.response?.status === 401) {
        setError("Session expired or unauthorized. Please login.");
        navigate("/login");
      } else {
        setError("Failed to fetch orders");
      }
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/admin/order/${orderId}`,
        { withCredentials: true }
      );
      fetchOrders(); // refresh after delete
    } catch (err) {
      console.error("❌ Failed to delete order:", err);
      alert("Failed to delete the order.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div className="admin-orders-container">
      <h2>📦 All Orders (Admin)</h2>
      <p>Total Revenue: ₹{totalAmount}</p>

      <div style={{ overflowX: "auto" }}>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Details</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user?.name || "N/A"}</td>
                <td>{order.user?.email || "N/A"}</td>
                <td>₹{order.totalPrice}</td>
                <td>
                  <OrderStatusUpdater
                    orderId={order._id}
                    currentStatus={order.orderStatus}
                    onStatusUpdated={fetchOrders}
                  />
                </td>
                <td>
                  <Link to={`/order/${order._id}`}>
                    <button className="view-btn">View</button>
                  </Link>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(order._id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllOrdersPage;
