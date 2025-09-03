import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setFetchedUser } from "../../redux/slices/authSlice";
import "./user.css";

function GetUser() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    try {
      const config = {
        withCredentials: true,
      };

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/me`,
        config
      );

      // Redux में user set करना
      dispatch(setFetchedUser(data.user));
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch user");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Redux से user get करना
  const { user: loggedInUser } = useSelector((state) => state.auth);

  console.log("🧠 User from Redux:", loggedInUser);

  return (
    <div className="user-container">
      <h2>User Details</h2>

      {loading ? (
        <p>Loading user...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : loggedInUser ? (
        <>
          <p>
            <strong>Name:</strong> {loggedInUser.name || "Name not available"}
          </p>
          <p>
            <strong>Email:</strong> {loggedInUser.email || "Email not available"}
          </p>

          {loggedInUser.file?.url ? (
            <img
              src={loggedInUser.file.url}
              alt="User Avatar"
              style={{
                width: "100px",
                borderRadius: "50%",
                marginTop: "10px",
              }}
            />
          ) : (
            <p>📸 No profile photo available</p>
          )}

          <p>
            <strong>Role:</strong> {loggedInUser.role || "Role not available"}
          </p>
          <p>
            <strong>Joined:</strong>{" "}
            {new Date(loggedInUser.createdAt).toLocaleDateString()}
          </p>
        </>
      ) : (
        <p>No user found</p>
      )}
    </div>
  );
}

export default GetUser;
