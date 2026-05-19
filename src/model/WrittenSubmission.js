const mongoose = require("mongoose");

const writtenSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examSlug: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "image"],
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    evaluatedMarks: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "evaluated"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WrittenSubmission", writtenSubmissionSchema);
