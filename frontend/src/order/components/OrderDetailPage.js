import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./OrderDetailPage.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/order/${id}`,
          { withCredentials: true }
        );
        setOrder(res.data.order);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;
  if (!order) return <p>No order found.</p>;

  const Section = ({ title, children }) => (
    <section className="section">
      <h3>{title}</h3>
      {children}
    </section>
  );

  return (
    <div className="order-detail-container">
      <h2>Order Details</h2>

      <Section title="Shipping Info">
        <p>
          <strong>Address:</strong>{" "}
          {order.shippingInfo?.address}, {order.shippingInfo?.city},{" "}
          {order.shippingInfo?.state}, {order.shippingInfo?.country} -{" "}
          {order.shippingInfo?.pinCode}
        </p>
        <p><strong>Phone:</strong> {order.shippingInfo?.phoneNo}</p>
      </Section>

      <Section title="User Info">
        <p><strong>Name:</strong> {order.user?.name}</p>
        <p><strong>Email:</strong> {order.user?.email}</p>
      </Section>

      {order.orderItems?.length > 0 && (
        <Section title="Order Items">
          <table className="order-items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{currencyFormatter.format(item.price)}</td>
                  <td>{currencyFormatter.format(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      <Section title="Payment Info">
        <p><strong>Status:</strong> {order.paymentInfo?.status || "N/A"}</p>
        <p>
          <strong>Paid At:</strong>{" "}
          {order.paidAt ? new Date(order.paidAt).toLocaleString() : "N/A"}
        </p>
      </Section>

      <Section title="Price Summary">
        <p><strong>Items:</strong> {currencyFormatter.format(order.itemsPrice)}</p>
        <p><strong>Tax:</strong> {currencyFormatter.format(order.taxPrice)}</p>
        <p><strong>Shipping:</strong> {currencyFormatter.format(order.shippingPrice)}</p>
        <p><strong>Total:</strong> {currencyFormatter.format(order.totalPrice)}</p>
      </Section>

      <Section title="Order Status">
        <p><strong>Status:</strong> {order.orderStatus}</p>
        {order.orderStatus === "Delivered" && order.deliveredAt && (
          <p><strong>Delivered At:</strong> {new Date(order.deliveredAt).toLocaleString()}</p>
        )}
      </Section>
    </div>
  );
};

export default OrderDetailPage;
