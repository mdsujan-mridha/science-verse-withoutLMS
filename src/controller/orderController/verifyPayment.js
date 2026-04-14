

const axios = require("axios");
const Order = require("../../model/OrderModel");

exports.bkashCallback = async (req, res) => {
  try {
    const { paymentID, status } = req.query;

    if (status !== "success") {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }

    const token = "BKASH_TOKEN"; // replace with real token function

    const response = await axios.post(
      "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute",
      { paymentID },
      {
        headers: {
          authorization: token,
          "x-app-key": process.env.BKASH_APP_KEY,
        },
      }
    );

    const data = response.data;

    const order = await Order.findOne({
      bkashPaymentID: paymentID,
    });

    if (!order) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }

    order.paymentStatus = "paid";
    order.transactionId = data.trxID;
    order.status = "completed";

    await order.save();

    // 🎉 redirect to success page
    res.redirect(
      `${process.env.FRONTEND_URL}/payment-success?orderId=${order._id}`
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};