import React from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../../redux/slices/authSlice";

function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) throw new Error("API URL is undefined. Check your .env file.");

      // Call logout API with cookies
      const { data } = await axios.get(`${apiUrl}/api/v1/logout`, {
        withCredentials: true, // important to clear cookies
      });

      console.log("✅ Logout successful:", data);

      // Clear Redux state and localStorage
      dispatch(clearUser());
      localStorage.removeItem("user");

      // Redirect to login page
      navigate("/auth");

      alert(data.message || "✅ Logged out successfully");
    } catch (error) {
      console.error("❌ Logout failed:", error);

      if (error.response) {
        alert(error.response.data.message || "❌ Logout failed on server");
      } else if (error.request) {
        alert("❌ No response from server. Is backend running?");
      } else {
        alert(`❌ Error: ${error.message}`);
      }
    }
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;
