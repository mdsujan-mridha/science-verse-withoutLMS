const mongoose = require("mongoose");

const examAttemptSchema = new mongoose.Schema(
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
    answers: [
      {
        questionId: {
          type: String, // from sanity _key or _id
          required: true,
        },
        selectedOptionId: {
          type: String, // from sanity _key
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    wrongAnswers: {
      type: Number,
      default: 0,
    },
    unanswered: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: null,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    status: {
      type: String,
      enum: ["started", "submitted", "abandoned"],
      default: "started",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamAttempt", examAttemptSchema);
