

const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: String,

    order: {
      type: Number,
      default: 0,
    },

    topics: [
      {
        title: String,
        content: String,
        videoUrl: String, // optional future use
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Syllabus", syllabusSchema);