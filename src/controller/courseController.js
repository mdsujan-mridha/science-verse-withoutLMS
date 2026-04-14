
const Course = require("../model/CourseMode");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
// create course -- admin

// exports.createCourse = async (req, res) => {
//     try {
//         const course = await Course.create(req.body);
//         res.status(201).json({
//             success: true,
//             message: "Course created successfully",
//             data: course
//         });


//     } catch (error) {
//         res.status(500).json({ message: error.message })
//     }
// }

// helper function
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "courses" },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

exports.createCourse = async (req, res) => {
    try {
        let thumbnailUrl = "";
        let thumbnailPublicId = "";

        // 🖼️ if image uploaded
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            thumbnailUrl = result.secure_url;
            thumbnailPublicId = result.public_id;
        }

        const course = await Course.create({
            ...req.body,
            thumbnail: thumbnailUrl, // save cloudinary URL
            thumbnailPublicId // save public ID for future deletion
        });

        res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: course,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// get all courses -- public 
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({
            status: "published"
        })

            .select("-syllabus")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Courses retrieved successfully",
            count: courses.length,
            data: courses
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


// get course details -- public (by slug)\
exports.getCourseDetails = async (req, res) => {
    try {
        const { slug } = req.params;
        const course = await Course.findOne({ slug, status: "published" }).populate("syllabus");

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json({
            success: true,
            message: "Course details retrieved successfully",
            data: course
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// update course-- admin
exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = { ...req.body };
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // 🖼️ if new image uploaded
        if (req.file) {
            if (course.thumbnailPublicId) {
                // delete old image from cloudinary
                await cloudinary.uploader.destroy(course.thumbnailPublicId);
            }
            const result = await uploadToCloudinary(req.file.buffer);
            updateData.thumbnail = result.secure_url;
            updateData.thumbnailPublicId = result.public_id;

        }
        const updatedCourse = await Course.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// delete course -- admin
exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByIdAndDelete(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        // delete image
        if (course.thumbnailPublicId) {
            await cloudinary.uploader.destroy(course.thumbnailPublicId);
        }
        await course.deleteOne()
        res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}