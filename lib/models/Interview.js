import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  panelistId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Panelist",
  },
  type: {
    type: String,
    required: true,
    enum: ["SDE1", "SDE2", "NET", "NET-2", "Frontend"],
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  count: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for uniqueness: each panelist can have only one count record per month/type
interviewSchema.index(
  { panelistId: 1, type: 1, year: 1, month: 1 },
  { unique: true }
);

const Interview = mongoose.models.Interview || mongoose.model("Interview", interviewSchema);

export default Interview;
