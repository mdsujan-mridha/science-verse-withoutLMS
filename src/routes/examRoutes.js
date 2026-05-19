const express = require("express");
const router = express.Router();
const examController = require("../controller/examController");
const { protect, optional } = require("../middlewares/auth");
const upload = require("../middlewares/uploadMiddleware");

// Public routes
router.get("/", examController.getExams);
router.get("/:slug", optional, examController.getExamBySlug);
router.get("/:slug/leaderboard", examController.getLeaderboard);

// Protected routes
router.get("/user/my-exams", protect, examController.getMyExams);
router.get("/user/my-exams/:slug/result", protect, examController.getExamResult);
router.post("/:slug/start", protect, examController.startExam);
router.post("/:slug/submit-mcq", protect, examController.submitMcqExam);
router.post("/:slug/submit-written", protect, upload.single("file"), examController.submitWritten);

// Admin CRUD routes (flexible dev endpoints)
router.post("/", examController.createExam);
router.put("/:id", examController.updateExam);
router.delete("/:id", examController.deleteExam);

module.exports = router;
