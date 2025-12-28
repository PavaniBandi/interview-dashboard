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
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { id } = req.query;

    if (req.method === "DELETE") {
      const interview = await Interview.findByIdAndDelete(id);
      if (!interview)
        return res.status(404).json({ error: "Interview not found" });
      res.status(200).json({ message: "Interview deleted successfully" });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
