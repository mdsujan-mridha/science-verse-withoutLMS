


const express = require('express');
const router = express.Router();
const { createCourse, getAllCourses, getCourseDetails, updateCourse, deleteCourse } = require("../controller/courseController");
const upload = require('../config/multer');



// Create a new course (admin)
router.post("/", upload.single("thumbnail"), createCourse);
router.get("/", getAllCourses);
router.get("/:id", getCourseDetails);
router.put("/:id", upload.single("thumbnail"), updateCourse);
router.delete("/:id", deleteCourse);

module.exports = router;
