import mongoose from "mongoose";
import dotenv from "dotenv";
import Panelist from "./models/Panelist.js";
import Interview from "./models/Interview.js";
import defaultData from "../src/data/defaultData.json" assert { type: "json" };

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/interview-dashboard"
    );
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Panelist.deleteMany({});
    await Interview.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Insert panelists
    const panelistsToInsert = defaultData.panelists.map((p) => ({
      name: p.name,
      email: p.email,
      phone: p.phone || "",
      linkedin: p.linkedin || "",
      status: p.status,
      interviewTypes: p.interviewTypes || [],
      paymentRates: p.paymentRates || {},
    }));

    const insertedPanelists = await Panelist.insertMany(panelistsToInsert);
    console.log(`✅ Inserted ${insertedPanelists.length} panelists`);

    // Insert interviews (convert old id references to new _id references)
    // Create a mapping of old IDs to new MongoDB IDs based on insertion order
    const panelistIdMap = {};
    defaultData.panelists.forEach((oldPanelist, index) => {
      panelistIdMap[oldPanelist.id] = insertedPanelists[index]._id;
    });

    // Aggregate interviews by panelistId, type, year, and month
    const interviewMap = new Map();
    defaultData.interviews.forEach((i) => {
      const mappedPanelistId = panelistIdMap[i.panelistId];
      if (!mappedPanelistId) return; // Skip if panelist not found

      const date = new Date(i.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const key = `${mappedPanelistId}|${i.type}|${year}|${month}`;
      if (interviewMap.has(key)) {
        const existing = interviewMap.get(key);
        existing.count += 1;
      } else {
        interviewMap.set(key, {
          panelistId: mappedPanelistId,
          type: i.type,
          year,
          month,
          count: 1,
        });
      }
    });

    const interviewsToInsert = Array.from(interviewMap.values());

    if (interviewsToInsert.length > 0) {
      const insertedInterviews = await Interview.insertMany(interviewsToInsert);
      console.log(`✅ Inserted ${insertedInterviews.length} interviews`);
    } else {
      console.log("⚠️  No interviews to insert (no valid panelist references)");
    }

    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
