



const Order = require("../model/OrderModel");
const Course = require("../model/CourseMode");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // from Firebase middleware
    const { courseId } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // prevent duplicate purchase
    const existing = await Order.findOne({
      user: userId,
      course: courseId,
      paymentStatus: "paid",
    });

    if (existing) {
      return res.status(400).json({ message: "Already purchased" });
    }

    const order = await Order.create({
      user: userId,
      course: courseId,
      amount: course.price,
      discountAmount: course.discountPrice || 0,
      finalAmount: course.price - (course.discountPrice || 0),
      status: "created",
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getSuccessOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("course") // 👈 HERE
      .populate("user");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      courseTitle: order.course.title,
      transactionId: order.transactionId,
      amount: order.finalAmount,

      facebookGroup: order.course.facebookGroupLink,
      whatsappGroup: order.course.whatsappGroupLink,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};