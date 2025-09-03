import React, { useState } from "react";
import { useSelector } from "react-redux";
import LogoutButton from './Signup/LogoutButton';

import "./MyProfile.css";

function MyProfile() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <p className="error-text">You are not login</p>;
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      <div className="profile-details">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>

        {/* Updated to use user.file instead of user.avatar */}
        {user.file?.url && (
          <>
            <img
              src={user.file.url}
              alt={user.name || "User Avatar"}
              className="profile-avatar"
              onClick={() => setIsModalOpen(true)}
              style={{ cursor: 'pointer' }}
            />

            {/* Modal for full screen image */}
            {isModalOpen && (
              <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                <div className="modal-content">
                  <img src={user.file.url} alt="Full View" className="modal-image" />
                </div>
              </div>
            )}
          </>
        )}

        <LogoutButton />
      </div>
    </div>
  );
}

export default MyProfile;
