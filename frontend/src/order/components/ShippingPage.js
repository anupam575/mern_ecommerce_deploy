import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { saveShippingInfo } from "../../redux/slices/shippingSlice";
import "react-toastify/dist/ReactToastify.css";
import "./ShippingPage.css";

const ShippingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const initialShipping = {
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
    phoneNo: "",
  };
  const [shippingInfo, setShippingInfo] = useState(initialShipping);

  const formFields = [
    { name: "address", label: "Address", type: "text" },
    { name: "city", label: "City", type: "text" },
    { name: "state", label: "State", type: "text" },
    { name: "country", label: "Country", type: "text" },
    { name: "pinCode", label: "Pin Code", type: "text" },
    { name: "phoneNo", label: "Phone Number (10 digits)", type: "tel", maxLength: 10 },
  ];

  const isPhoneValid = (phone) => /^\d{10}$/.test(phone);

  const isFormValid = () => {
    const allFilled = Object.keys(shippingInfo).every(
      (key) => shippingInfo[key].trim() !== ""
    );
    return allFilled && isPhoneValid(shippingInfo.phoneNo);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNo") {
      if (value === "" || /^\d*$/.test(value)) {
        setShippingInfo((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setShippingInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error("Please fill all fields correctly. Phone must be 10 digits.");
      return;
    }

    dispatch(saveShippingInfo(shippingInfo));

    // Prices
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const taxPrice = Number((itemsPrice * 0.18).toFixed(2));
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Order items
    const orderItems = cartItems.map((item) => ({
      name: item.title,
      quantity: item.quantity,
      image: item.img,
      price: item.price,
      product: item.id,
    }));

    navigate("/payment");
  };

  return (
    <div className="shipping-container">
      <ToastContainer />
      <div className="shipping-left">
        <h2>Cart Summary</h2>
        {cartItems.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          <ul>
            {cartItems.map((item) => (
              <li key={item.id}>
                <div className="summary-item">
                  <img src={item.img} alt={item.title} />
                  <div>
                    <p>{item.title}</p>
                    <p>₹{item.price} × {item.quantity}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <h3>Total: ₹{cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}</h3>
      </div>

      <div className="shipping-right">
        <h2>Shipping Address</h2>
        <form onSubmit={handleSubmit} className="shipping-form" noValidate>
          {formFields.map((field) => (
            <div key={field.name} className="form-group">
              <label htmlFor={field.name}>{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                id={field.name}
                placeholder={field.label}
                value={shippingInfo[field.name]}
                onChange={handleChange}
                maxLength={field.maxLength || undefined}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="submit-btn"
            disabled={cartItems.length === 0 || !isFormValid()}
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShippingPage;
