
const Order = require("../model/OrderModel");
const Course = require("../model/CourseMode");
const ExamProduct = require("../model/ExamProduct");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // from Firebase middleware
    const { courseId, examId } = req.body;

    if (!courseId && !examId) {
      return res.status(400).json({ message: "Course or Exam ID is required" });
    }

    let product, isCourse = false;
    if (courseId) {
      product = await Course.findById(courseId);
      isCourse = true;
    } else {
      product = await ExamProduct.findById(examId);
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // prevent duplicate purchase
    const existing = await Order.findOne({
      user: userId,
      ...(isCourse ? { course: courseId } : { exam: examId }),
      paymentStatus: "paid",
    });

    if (existing) {
      return res.status(400).json({ message: "Already purchased" });
    }

    const orderData = {
      user: userId,
      amount: product.price,
      discountAmount: product.discountPrice || 0,
      finalAmount: product.price - (product.discountPrice || 0),
      status: "created",
    };
    if (isCourse) orderData.course = courseId;
    if (!isCourse) orderData.exam = examId;

    const order = await Order.create(orderData);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getSuccessOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("course")
      .populate("exam")
      .populate("user");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isCourse = !!order.course;
    const product = isCourse ? order.course : order.exam;

    res.json({
      courseTitle: product.title,
      transactionId: order.transactionId,
      amount: order.finalAmount,

      facebookGroup: isCourse ? product.facebookGroupLink : undefined,
      whatsappGroup: isCourse ? product.whatsappGroupLink : undefined,
      isExam: !isCourse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};