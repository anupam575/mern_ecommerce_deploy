import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import sendToken from "../utils/jwtToken.js";

export const isAuthenticatedUser = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Header me Bearer token check karo
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    // 2️⃣ Agar header me nahi mila to cookies me check karo
    else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // 3️⃣ Agar dono jagah token nahi mila
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login to access this resource",
      });
    }

    try {
      // ✅ Verify Access Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      req.user = user;
      next();
    } catch (err) {
      // 🔄 Access token expired → check refresh token
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Token expired, please login again",
        });
      }

      try {
        const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedRefresh.id);
        if (!user) throw new Error("User not found");

        // 🔄 New tokens generate karke bhejo
        sendToken(user, 200, res);
        req.user = user;
        next();
      } catch (refreshErr) {
        return res.status(403).json({
          success: false,
          message: "Invalid refresh token, please login again",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Role Authorization Middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "User info missing" });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Role: ${req.user.role} is not allowed to access this resource`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
};
