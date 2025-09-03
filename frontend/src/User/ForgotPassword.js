import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ Redux selector
import "./forgotPassword.css";

const ForgotPassword = () => {
  const { user: loggedInUser } = useSelector((state) => state.auth); // ✅
  const token = loggedInUser?.token; // ✅ Token from Redux (optional here)

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const forgotPasswordHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        headers: { "Content-Type": "application/json" },
        // Authorization: `Bearer ${token}`, ❌ Not needed here
      };

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/password/forgot`,
        { email },
        config
      );

      alert(data.message);

      if (data.resetToken) {
        navigate(`/password/reset/${data.resetToken}`);
      } else {
        alert("Please check your email for the reset link.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <form className="forgot-form" onSubmit={forgotPasswordHandler}>
        <h2>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;

