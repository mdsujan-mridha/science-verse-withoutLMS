

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // 👤 User who bought the course
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📘 Course being purchased
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // 💰 Pricing snapshot (important for history)
    amount: {
      type: Number,
      required: true,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    finalAmount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "BDT",
    },

    // 💳 Payment info
    paymentMethod: {
      type: String,
      enum: ["bkash"],
      default: "bkash",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // 🔑 bKash tracking
    bkashPaymentID: {
      type: String,
      default: null,
    },

    transactionId: {
      type: String,
      default: null,
    },

    // 🔗 Success page data helper
    isSuccessPageViewed: {
      type: Boolean,
      default: false,
    },

    // 🧠 optional coupon support
    couponCode: {
      type: String,
      default: null,
    },

    couponDiscount: {
      type: Number,
      default: 0,
    },

    // 🛡️ status tracking (for admin/debugging)
    status: {
      type: String,
      enum: ["created", "processing", "completed", "cancelled"],
      default: "created",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);