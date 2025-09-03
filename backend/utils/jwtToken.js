import { generateAccessToken, generateRefreshToken } from "../models/userModel.js";

const sendToken = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const isProd = process.env.NODE_ENV === "production";

  // ✅ Updated cookie options with path for production
  const accessOptions = {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    httpOnly: true,
    secure: isProd,          // must be true for HTTPS
    sameSite: isProd ? "None" : "Lax",
    path: "/",               // 🔹 send cookie for all routes
  };

  const refreshOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/",               // 🔹 send cookie for all routes
  };

  // ✅ Send cookies and minimal user info
  res
    .status(statusCode)
    .cookie("accessToken", accessToken, accessOptions)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        file: user.file || null,
      },
    });
};

export default sendToken;
