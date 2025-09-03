import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setFetchedUser } from "../../redux/slices/authSlice";
import "./user.css";

const initialFormState = {
  name: "",
  email: "",
  avatar: null, // file
  preview: "",  // image preview
};

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const { user: loggedInUser } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Populate form from logged-in user
  useEffect(() => {
    if (loggedInUser) {
      setFormData({
        name: loggedInUser.name || "",
        email: loggedInUser.email || "",
        avatar: null,
        preview: loggedInUser.file?.url || "",
      });
    }
  }, [loggedInUser]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle avatar file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        avatar: file,
        preview: URL.createObjectURL(file),
      }));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (formData.avatar) data.append("file", formData.avatar);

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      };

      const { data: res } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/me/update`,
        data,
        config
      );

      dispatch(setFetchedUser(res.user));
      setSuccess("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "❌ Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-container">
      <h2>Update Profile</h2>

      {loading && <p>Updating...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Avatar:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {formData.preview && (
          <div>
            <p>Preview:</p>
            <img
              src={formData.preview}
              alt="Preview"
              style={{ width: "100px", borderRadius: "50%" }}
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;
