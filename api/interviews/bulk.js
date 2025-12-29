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
    if (req.method === "POST") {
      const { interviews } = req.body;
      if (!interviews || !Array.isArray(interviews)) {
        return res.status(400).json({ error: "interviews must be an array" });
      }
      const createdInterviews = await Interview.insertMany(interviews);
      res.status(201).json(createdInterviews);
    } else {
      res.setHeader("Allow", "POST, HEAD, OPTIONS");
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
