import { connectDB, setCORS } from "../../api/db.js";
import Panelist from "../../lib/models/Panelist.js";

export default async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return res
      .status(500)
      .json({ error: "Database connection failed: " + error.message });
  }

  setCORS(res);

  // Handle OPTIONS and HEAD requests
  if (req.method === "OPTIONS" || req.method === "HEAD") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "GET") {
      const panelists = await Panelist.find().sort({ createdAt: -1 });
      res.status(200).json(panelists);
    } else if (req.method === "POST") {
      const panelist = new Panelist(req.body);
      await panelist.save();
      res.status(201).json(panelist);
    } else {
      res.setHeader("Allow", "GET, POST, HEAD, OPTIONS");
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in panelists route:", error);
    res.status(500).json({ error: error.message });
  }
};
