import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/authSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";

// ✅ Always send credentials for cookie-based auth
axios.defaults.withCredentials = true;

// 🔹 Initial form state
const initialFormState = {
  email: "",
  password: "",
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 Auto refresh access token if expired
  const refreshAccessToken = async () => {
    try {
      // Direct API URL
      const { data } = await axios.get("http://localhost:4000/api/v1/refresh-token", {
        withCredentials: true,
      });
      if (data?.user) {
        dispatch(setUser(data.user));
      }
      return data.accessToken;
    } catch (err) {
      console.error("❌ Refresh token failed:", err.response?.data || err.message);
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };

      // Direct API URL
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/login",
        formData,
        config
      );

      dispatch(setUser(data.user));

      toast.success("✅ Logged in successfully!");
      setFormData(initialFormState);

      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.message || "❌ Login failed!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Auto-refresh token every 14 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      const newToken = await refreshAccessToken();
      if (newToken) {
        console.log("🔄 Access token refreshed");
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={loginHandler}>
        <h2>Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="password-wrapper" style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ paddingRight: "230px" }}
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p
          style={{ cursor: "pointer", color: "blue", marginTop: "10px" }}
          onClick={() => navigate("/password/forgot")}
        >
          Forgot Password?
        </p>
      </form>

      <ToastContainer position="top-center" autoClose={1500} />
    </div>
  );
};

export default Login;
