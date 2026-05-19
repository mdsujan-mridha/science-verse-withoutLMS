const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  optionText: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false,
  }
});

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
    default: 1,
  },
  negativeMark: {
    type: Number,
    default: 0.25,
  },
  options: [optionSchema],
  explanation: {
    type: String,
    default: "",
  }
});

const examProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    totalEnrollments: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    // Extended fields to support full MongoDB-based Exam CRUD
    shortDescription: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: 10,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ["SSC", "HSC", "Admission", "Other"],
      default: "HSC",
    },
    examType: {
      type: String,
      enum: ["MCQ", "CQ", "Mixed"],
      default: "MCQ",
    },
    subject: {
      type: String,
      default: "",
    },
    paper: {
      type: String,
      default: "1st",
    },
    category: {
      type: String,
      default: "Regular",
    },
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamProduct", examProductSchema);
