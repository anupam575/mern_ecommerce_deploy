import app from "./app.js";
import { v2 as cloudinary } from "cloudinary";
import connectDatabase from "./config/database.js";
import dotenv from "dotenv";

// ✅ Load env
dotenv.config({ path: "./config/config.env" });

// ✅ Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

// ✅ DB connection
connectDatabase();

// ✅ Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// ✅ Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err.message);
  server.close(() => process.exit(1));
});

// ✅ Graceful shutdown (optional)
process.on("SIGTERM", () => {
  console.log("📴 SIGTERM received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});
