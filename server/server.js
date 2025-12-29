import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Panelist from "./models/Panelist.js";
import Interview from "./models/Interview.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/interview-dashboard"
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

// Routes

// Panelists
app.get("/api/panelists", async (req, res) => {
  try {
    const panelists = await Panelist.find().sort({ createdAt: -1 });
    res.json(panelists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/panelists", async (req, res) => {
  try {
    const panelist = new Panelist(req.body);
    await panelist.save();
    res.status(201).json(panelist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/panelists/:id", async (req, res) => {
  try {
    const panelist = await Panelist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!panelist) {
      return res.status(404).json({ error: "Panelist not found" });
    }
    res.json(panelist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/panelists/:id", async (req, res) => {
  try {
    const panelist = await Panelist.findByIdAndDelete(req.params.id);
    if (!panelist) {
      return res.status(404).json({ error: "Panelist not found" });
    }
    // Also delete associated interviews
    await Interview.deleteMany({ panelistId: req.params.id });
    res.json({ message: "Panelist deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Interviews
app.get("/api/interviews", async (req, res) => {
  try {
    const interviews = await Interview.find().sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/interviews", async (req, res) => {
  try {
    const interview = new Interview(req.body);
    await interview.save();
    res.status(201).json(interview);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bulk add interviews
app.post("/api/interviews/bulk", async (req, res) => {
  try {
    const { interviews } = req.body;
    if (!interviews || !Array.isArray(interviews)) {
      return res.status(400).json({ error: "interviews must be an array" });
    }
    if (interviews.length === 0) {
      return res.status(400).json({ error: "interviews array cannot be empty" });
    }

    // Validate required fields
    for (const interview of interviews) {
      if (!interview.panelistId || !interview.type || !interview.year || !interview.month) {
        return res.status(400).json({ error: "Each interview must have panelistId, type, year, and month" });
      }
      if (typeof interview.count !== 'number' || interview.count < 1) {
        return res.status(400).json({ error: "Each interview must have a count >= 1" });
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
  } catch (error) {
    console.error("Error in bulk POST:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Bulk delete interviews - MUST come before :id route
app.delete("/api/interviews/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "ids must be an array" });
    }
    if (ids.length === 0) {
      return res.status(400).json({ error: "ids array cannot be empty" });
    }
    const result = await Interview.deleteMany({ _id: { $in: ids } });
    res.json({ 
      message: `Deleted ${result.deletedCount} interviews`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Error in bulk-delete:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/interviews/:id", async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }
    res.json({ message: "Interview deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
