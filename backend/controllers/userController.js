// userController.js ke upar
import crypto from "crypto";

import sendEmail from "../utils/sendEmail.js"; // correct path check karo

import sendToken from "../utils/jwtToken.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";
import User from "../models/userModel.js";

export const registerUser = async (req, res) => {
  try {
    console.log("📥 Incoming Register Request...", req.body, req.file);

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // ✅ Do NOT hash password here. Model pre('save') will hash it automatically
    let userData = {
      name,
      email: email.toLowerCase().trim(),
      password, // raw password
    };

    // File upload
    if (req.file) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: "users_files" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });

      userData.file = {
        public_id: uploaded.public_id,
        url: uploaded.secure_url,
      };
    }

    // Save user
    const user = await User.create(userData);
    console.log("✅ User created successfully:", user);

    // Send JWT token
    sendToken(user, 201, res);
  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Debug: Check incoming request
    console.log("📥 Login request body:", req.body);

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Email & Password" });
    }

    // 🔹 Debug: Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    console.log("🔎 User fetched from DB:", user);

    if (!user) {
      console.log("❌ User not found with this email:", email);
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // 🔹 Debug: Compare password
    const isPasswordMatched = await user.comparePassword(password);
    console.log("🔑 Password match result:", isPasswordMatched);

    if (!isPasswordMatched) {
      console.log("❌ Password mismatch for user:", email);
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    console.log("✅ Login successful for user:", email);
    sendToken(user, 200, res);
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Logout User
export const logout = async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce Password Recovery`,
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
        resetToken,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Token-based Reset Password
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset Password Token is invalid or has expired",
      });
    }

    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide both passwords" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get User Detail
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update User password
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "password does not match" });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Updat
// Get all users (admin)
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update name/email
    const { name, email } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;

    // Update avatar/file if new file is uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      if (user.file && user.file.public_id) {
        await cloudinary.v2.uploader.destroy(user.file.public_id);
      }

      // Upload new image using stream (memoryStorage compatible)
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: "users_files" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      // Save uploaded image info in user model
      user.file = {
        public_id: uploaded.public_id,
        url: uploaded.secure_url,
      };
    }

    // Save user
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(" Update Profile Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User does not exist with Id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update User Role -- Admin
export const updateUserRole = async (req, res) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get All Users -- Admin
export const getAllUser = async (req, res) => {
  try {
    const users = await User.find(); // सभी users fetch करें
    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // ID validation
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User does not exist with Id: ${userId}`,
      });
    }

    // Delete avatar from Cloudinary if exists
    if (user.avatar && user.avatar.public_id) {
      try {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      } catch (cloudErr) {
        console.error("Cloudinary deletion error:", cloudErr);
      }
    }

    // Delete user from DB
    await User.deleteOne({ _id: userId }); // <-- updated line

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error: " + err.message,
    });
  }
};