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
      if (interviews.length === 0) {
        return res
          .status(400)
          .json({ error: "interviews array cannot be empty" });
      }

      // Validate required fields
      for (const interview of interviews) {
        if (
          !interview.panelistId ||
          !interview.type ||
          !interview.year ||
          !interview.month
        ) {
          return res
            .status(400)
            .json({
              error:
                "Each interview must have panelistId, type, year, and month",
            });
        }
        if (typeof interview.count !== "number" || interview.count < 1) {
          return res
            .status(400)
            .json({ error: "Each interview must have a count >= 1" });
        }
      }

      // Use upsert to update existing records or insert new ones
      const createdInterviews = [];
      for (const interview of interviews) {
        const { panelistId, type, year, month, count } = interview;
        const result = await Interview.findOneAndUpdate(
          { panelistId, type, year, month },
          { count },
          { upsert: true, new: true, runValidators: true }
        );
        createdInterviews.push(result);
      }

      res.status(201).json(createdInterviews);
    } else {
      res.setHeader("Allow", "POST, HEAD, OPTIONS");
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in bulk POST:", error.message);
    res.status(400).json({ error: error.message });
  }
};
