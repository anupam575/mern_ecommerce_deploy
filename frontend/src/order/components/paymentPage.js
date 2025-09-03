import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./paymentPage.css";

// Stripe setup
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || "");

const CheckoutForm = ({ amount, orderItems, shippingInfo, prices }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const getClientSecret = async () => {
      setLoading(true);
      try {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/payment/process`,
          { amount },
          { withCredentials: true }
        );
        setClientSecret(data.client_secret);
      } catch (error) {
        console.error("Error creating payment intent:", error.response?.data || error.message);
        setPaymentError("Failed to create payment intent.");
        toast.error("⚠️ Failed to create payment intent");
      } finally {
        setLoading(false);
      }
    };
    getClientSecret();
  }, [amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaymentError("");
    setLoading(true);
    const card = elements.getElement(CardElement);

    try {
      const result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });

      if (result.error) {
        setPaymentError(result.error.message);
        toast.error(`❌ ${result.error.message}`);
      } else if (result.paymentIntent.status === "succeeded") {
        const paymentInfo = {
          id: result.paymentIntent.id,
          status: result.paymentIntent.status,
        };

        const orderData = {
          shippingInfo,
          orderItems,
          paymentInfo,
          ...prices,
        };

        try {
          const { data } = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/v1/order/new`,
            orderData,
            { withCredentials: true }
          );
          setOrderId(data.order._id);
          setPaymentSucceeded(true);
          toast.success("✅ Payment successful and order placed!");
        } catch (error) {
          console.error("Error placing order:", error.response?.data);
          setPaymentError("Order placement failed.");
          toast.error("❌ Payment done, but order placement failed!");
        }
      }
    } catch (err) {
      console.error(err);
      setPaymentError("Payment failed.");
      toast.error("❌ Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentSucceeded) {
    return (
      <div className="payment-success-container">
        <ToastContainer />
        <h2>✅ Payment Successful!</h2>
        <button className="order-detail-btn" onClick={() => navigate(`/order/${orderId}`)}>
          View Order Full Details
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <ToastContainer />
      {loading && <p className="loading-text">Processing...</p>}
      <CardElement className="card-element" options={{ hidePostalCode: true }} />
      {paymentError && <p className="payment-error">{paymentError}</p>}
      <button type="submit" disabled={!stripe || loading || !clientSecret} className="pay-button">
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const cartItems = useSelector((state) => state.cart.items) || [];
  const shippingInfo = useSelector((state) => state.shipping.shippingInfo) || {};

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const taxPrice = Number((itemsPrice * 0.18).toFixed(2));
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const orderItems = cartItems.map((item) => ({
    name: item.title,
    quantity: item.quantity,
    image: item.img,
    price: item.price,
    product: item.id,
  }));

  return (
    <Elements stripe={stripePromise}>
      <div className="payment-container">
        <h2>Total Amount: ₹{totalPrice}</h2>
        <CheckoutForm
          amount={Math.round(totalPrice * 100)}
          orderItems={orderItems}
          shippingInfo={shippingInfo}
          prices={{ itemsPrice, taxPrice, shippingPrice, totalPrice }}
        />
      </div>
    </Elements>
  );
};

export default PaymentPage;
