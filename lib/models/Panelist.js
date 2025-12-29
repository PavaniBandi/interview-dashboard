import mongoose from "mongoose";

const panelistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  linkedin: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["active", "standby", "inactive"],
    default: "active",
  },
  interviewTypes: {
    type: [String],
    default: [],
  },
  paymentRates: {
    type: Map,
    of: Number,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Disable automatic index creation in serverless environments
panelistSchema.set("autoIndex", false);

const Panelist = mongoose.models.Panelist || mongoose.model("Panelist", panelistSchema);

export default Panelist;

const Panelist =
  mongoose.models.Panelist || mongoose.model("Panelist", panelistSchema);

export default Panelist;
