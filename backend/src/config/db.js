import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in backend/.env");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

export default connectDB;
