

const axios = require("axios");
const Order = require("../../model/OrderModel");

exports.initiateBkashPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("course");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // TODO: get token from bKash
    const token = "BKASH_TOKEN"; // replace with real token function

    const response = await axios.post(
      "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create",
      {
        mode: "0011",
        payerReference: order.user.toString(),
        callbackURL: `${process.env.BASE_URL}/api/payment/bkash/callback`,
        amount: order.finalAmount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: order._id.toString(),
      },
      {
        headers: {
          authorization: token,
          "x-app-key": process.env.BKASH_APP_KEY,
        },
      }
    );

    order.bkashPaymentID = response.data.paymentID;
    order.status = "processing";
    await order.save();

    res.json({
      bkashURL: response.data.bkashURL,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};