

const axios = require("axios");
const Order = require("../../model/OrderModel");
const User = require("../../model/UserModel");
const Course = require("../../model/CourseMode");
const ExamProduct = require("../../model/ExamProduct");

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

    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.transactionId = data.trxID;
      order.status = "completed";
      await order.save();

      // Update user enrollments and product stats
      const user = await User.findById(order.user);
      if (order.course) {
        if (user && !user.enrolledCourses.includes(order.course)) {
          user.enrolledCourses.push(order.course);
        }
        await Course.findByIdAndUpdate(order.course, {
          $inc: { totalEnrollments: 1, totalRevenue: order.finalAmount }
        });
      } else if (order.exam) {
        if (user && !user.enrolledExams.includes(order.exam)) {
          user.enrolledExams.push(order.exam);
        }
        await ExamProduct.findByIdAndUpdate(order.exam, {
          $inc: { totalEnrollments: 1, totalRevenue: order.finalAmount }
        });
      }
      if (user) await user.save();
    }

    // 🎉 redirect to success page
    res.redirect(
      `${process.env.FRONTEND_URL}/payment-success?orderId=${order._id}`
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};