const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema(
  {
    examSlug: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    timeSpent: {
      type: Number,
      required: true,
    },
    rank: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
