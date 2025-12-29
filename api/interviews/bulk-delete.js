import mongoose from "mongoose";
import Interview from "../../lib/models/Interview.js";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

export default async (req, res) => {
  await connectDB();

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT,HEAD"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS and HEAD requests
  if (req.method === "OPTIONS" || req.method === "HEAD") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "DELETE") {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "ids must be an array" });
      }
      const result = await Interview.deleteMany({ _id: { $in: ids } });
      res
        .status(200)
        .json({ message: `Deleted ${result.deletedCount} interviews` });
    } else {
      res.setHeader("Allow", "DELETE, HEAD, OPTIONS");
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
