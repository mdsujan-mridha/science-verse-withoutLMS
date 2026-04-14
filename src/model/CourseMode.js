const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    slug: { type: String, unique: true, lowercase: true },

    description: { type: String, required: true },

    thumbnail: String,
    introVideo: String,

    price: { type: Number, default: 0 },

    discountPrice: { type: Number, default: 0 },

    isFree: { type: Boolean, default: false },

    level: {
      type: String,
      enum: ["SSC", "HSC", "Admission"],
      required: true,
    },

    duration: { type: String, required: true },

    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },

    facebookGroupLink: {
      type: String,
      required: true,
    },

    whatsappGroupLink: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      enum: ["Physics", "Chemistry", "Math", "ICT"],
      required: true,
    },

    features: [String],

    faq: [
      {
        question: String,
        answer: String,
      },
    ],

    syllabus: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Syllabus",
      },
    ],

    tags: [String],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// auto slug
courseSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/ /g, "-");
  }
  next();
});

module.exports = mongoose.model("Course", courseSchema);