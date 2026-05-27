import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MongoDB connection error ❌: MONGODB_URI is not defined in environment variables.");
    return;
  }

  try {
    await mongoose.connect(uri, { dbName: "jsd12-express-app" });
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection error ❌", err.message);
    throw err;
  }
}
