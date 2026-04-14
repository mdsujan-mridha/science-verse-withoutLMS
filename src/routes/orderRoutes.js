

const express = require("express");
const { createOrder, getSuccessOrder } = require("../controller/orderController");
const { initiateBkashPayment } = require("../controller/orderController/initiatePayment");
const { bkashCallback } = require("../controller/orderController/verifyPayment");

const {protect} = require("../middlewares/auth")

const router = express.Router();




// 🛒 Create order (user must be logged in)
router.post("/create", protect, createOrder);

// 💳 Start bKash payment
router.post("/bkash/init", protect, initiateBkashPayment);

// 🔁 bKash callback (NO protect ❗)
router.get("/bkash/callback", bkashCallback);

// 🎉 Success page data
router.get("/success/:orderId", protect, getSuccessOrder);

module.exports = router;





