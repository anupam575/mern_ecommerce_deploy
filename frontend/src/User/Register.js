import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./register.css";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  avatar: null,
};

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState(null);

  // Form fields definition for map()
  const formFields = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: true },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, avatar: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          if (key === "avatar") {
            data.append("file", formData.avatar);
          } else {
            data.append(key, formData[key]);
          }
        }
      });

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/register`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setMessage(res.data.message || "Registration successful!");
      setFormData(initialFormData);
      setPreview(null);
      navigate("/profiles"); // ya "/" home page
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Register</h2>
        {message && <p className="register-message">{message}</p>}

        <form onSubmit={handleSubmit} className="register-form">
          {formFields.map((field) => (
            <div key={field.name} className="input-wrapper" style={{ position: "relative" }}>
              <input
                type={field.name === "password" ? (showPassword ? "text" : "password") : field.type}
                name={field.name}
                placeholder={field.label}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required}
                className="register-input"
                style={field.name === "password" ? { paddingRight: "40px" } : {}}
              />
              {field.name === "password" && (
                <span
                  onClick={() => setShowPassword(!showPassword)}
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
              )}
            </div>
          ))}

          <div className="input-wrapper">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="register-input"
            />
          </div>

          {preview && <img src={preview} alt="Avatar Preview" className="register-avatar" />}

          <button type="submit" className="register-button">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
