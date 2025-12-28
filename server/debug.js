import mongoose from "mongoose";
import Interview from "./models/Interview.js";
import dotenv from "dotenv";

dotenv.config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const count = await Interview.countDocuments();
    console.log("\nTotal interview records:", count);

    // Get sample interviews
    const samples = await Interview.find().limit(5);
    console.log("\nSample interview records:");
    samples.forEach((i, idx) => {
      console.log(
        `${idx + 1}. Year: ${i.year}, Month: ${i.month}, Type: ${
          i.type
        }, Count: ${i.count}, PanelistId: ${i.panelistId}`
      );
    });

    // Check for November 2025
    const nov2025Count = await Interview.countDocuments({
      year: 2025,
      month: 11,
    });
    console.log("\nNovember 2025 interview records:", nov2025Count);

    const nov2025Samples = await Interview.find({
      year: 2025,
      month: 11,
    }).limit(3);
    console.log("November 2025 samples:");
    nov2025Samples.forEach((i, idx) => {
      console.log(
        `${idx + 1}. Type: ${i.type}, Count: ${i.count}, PanelistId: ${
          i.panelistId
        }`
      );
    });

    // Get all unique year/month combinations
    const uniqueMonths = await Interview.aggregate([
      { $group: { _id: { year: "$year", month: "$month" } } },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);
    console.log("\nUnique year/month combinations:", uniqueMonths);

    // Total interview count (sum of all counts)
    const totalInterviews = await Interview.aggregate([
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);
    console.log(
      "\nTotal actual interviews (sum of counts):",
      totalInterviews[0]?.total || 0
    );

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

checkDB();
