import axios from "axios";
import { useEffect, useState } from "react";
import "./AllOrdersAdmin.css";

const AllOrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redux से token अब जरूरत नहीं क्योंकि cookies handle कर रही हैं
  // const { user: loggedInUser } = useSelector((state) => state.auth);
  // const token = loggedInUser?.token;

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/admin/orders`,
          {
            withCredentials: true, // ✅ cookies भेजने के लिए जरूरी
          }
        );
        // Backend से orders और totalAmount मिलेंगे
        setOrders(data.orders);
        setTotalAmount(data.totalAmount);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []); // अब token dependency नहीं है

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="all-orders-container">
      <h2>Admin: All Orders</h2>
      <p className="total-revenue">
        <strong>Total Revenue:</strong> ₹{totalAmount}
      </p>
      <ul className="order-list">
        {orders.map((order) => (
          <li key={order._id} className="order-item">
            <strong>Order ID:</strong> {order._id} <br />
            <strong>Status:</strong> {order.orderStatus} <br />
            <strong>Total Price:</strong> ₹{order.totalPrice} <br />
            <strong>User:</strong> {order.user?.name || "N/A"} <br />
            <strong>Email:</strong> {order.user?.email || "N/A"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllOrdersAdmin;
