const ExamProduct = require("../model/ExamProduct");
const ExamAttempt = require("../model/ExamAttempt");
const WrittenSubmission = require("../model/WrittenSubmission");
const Leaderboard = require("../model/Leaderboard");
const User = require("../model/UserModel");
const sanityClient = require("../config/sanityClient");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const MOCK_EXAMS = [
  {
    _id: "mock_physics_mcq_1",
    title: "HSC Physics MCQ - Chapter 1: Physical World and Measurement",
    slug: { current: "physics-mcq-1" },
    shortDescription: "A comprehensive MCQ practice exam on Physical World, Dimensions, Units and Measurements for HSC students.",
    thumbnail: null,
    level: "HSC",
    examType: "MCQ",
    subject: "Physics",
    paper: "1st",
    category: "Regular",
    duration: 10,
    totalMarks: 5,
    isPublished: true,
    publishedAt: "2026-05-18T12:00:00.000Z",
    questions: [
      {
        _key: "q1",
        questionText: "Which of the following is not a fundamental physical quantity?",
        marks: 1,
        negativeMark: 0.25,
        options: [
          { _key: "q1_o1", optionText: "Mass", isCorrect: false },
          { _key: "q1_o2", optionText: "Length", isCorrect: false },
          { _key: "q1_o3", optionText: "Time", isCorrect: false },
          { _key: "q1_o4", optionText: "Velocity", isCorrect: true }
        ],
        explanation: "Velocity is a derived quantity (Length / Time), whereas Mass, Length, and Time are fundamental quantities."
      },
      {
        _key: "q2",
        questionText: "What is the dimensional formula for Force?",
        marks: 1,
        negativeMark: 0.25,
        options: [
          { _key: "q2_o1", optionText: "[MLT^-1]", isCorrect: false },
          { _key: "q2_o2", optionText: "[MLT^-2]", isCorrect: true },
          { _key: "q2_o3", optionText: "[ML^2T^-2]", isCorrect: false },
          { _key: "q2_o4", optionText: "[ML^-1T^-2]", isCorrect: false }
        ],
        explanation: "Force = Mass * Acceleration. Dimension of Mass is [M], Acceleration is [LT^-2]. Thus, Force is [MLT^-2]."
      },
      {
        _key: "q3",
        questionText: "The unit of Planck's Constant is:",
        marks: 1,
        negativeMark: 0.25,
        options: [
          { _key: "q3_o1", optionText: "Joule-second (J·s)", isCorrect: true },
          { _key: "q3_o2", optionText: "Joule/second (J/s)", isCorrect: false },
          { _key: "q3_o3", optionText: "Joule-meter (J·m)", isCorrect: false },
          { _key: "q3_o4", optionText: "Joule/meter (J/m)", isCorrect: false }
        ],
        explanation: "E = hν => h = E/ν. E is energy (Joule) and ν is frequency (1/second). So, unit of h is Joule-second (J·s)."
      },
      {
        _key: "q4",
        questionText: "Which of the following physical quantities is dimensionless and has no unit?",
        marks: 1,
        negativeMark: 0.25,
        options: [
          { _key: "q4_o1", optionText: "Strain", isCorrect: true },
          { _key: "q4_o2", optionText: "Stress", isCorrect: false },
          { _key: "q4_o3", optionText: "Pressure", isCorrect: false },
          { _key: "q4_o4", optionText: "Surface Tension", isCorrect: false }
        ],
        explanation: "Strain is the ratio of change in dimension to original dimension, hence it is dimensionless and unitless."
      },
      {
        _key: "q5",
        questionText: "Light year is the unit of:",
        marks: 1,
        negativeMark: 0.25,
        options: [
          { _key: "q5_o1", optionText: "Time", isCorrect: false },
          { _key: "q5_o2", optionText: "Distance", isCorrect: true },
          { _key: "q5_o3", optionText: "Intensity of light", isCorrect: false },
          { _key: "q5_o4", optionText: "Velocity of light", isCorrect: false }
        ],
        explanation: "Light year is the distance light travels in one vacuum year, which is approx. 9.46 trillion kilometers."
      }
    ]
  }
];

// Helper to format Mongo questions into compatible Sanity format
const formatMongoQuestions = (mongoQuestions, hideAnswers = false) => {
  if (!mongoQuestions) return [];
  return mongoQuestions.map((q) => {
    const formattedOptions = q.options.map((opt) => {
      if (hideAnswers) {
        return {
          _key: opt._id.toString(),
          optionText: opt.optionText,
        };
      }
      return {
        _key: opt._id.toString(),
        optionText: opt.optionText,
        isCorrect: opt.isCorrect,
      };
    });

    return {
      _key: q._id.toString(),
      questionText: q.questionText,
      marks: q.marks || 1,
      negativeMark: q.negativeMark || 0.25,
      options: formattedOptions,
      explanation: hideAnswers ? null : (q.explanation || ""),
    };
  });
};

// Helper function to check enrollment
const isUserEnrolled = async (userId, examSlug) => {
  const exam = await ExamProduct.findOne({ slug: examSlug });
  if (exam && (exam.isFree || exam.price === 0)) return true;

  const user = await User.findById(userId).populate("enrolledExams");
  if (!user) return false;
  return user.enrolledExams.some((exam) => exam.slug === examSlug);
};

exports.getExams = async (req, res) => {
  try {
    let sanityExams = [];
    try {
      const sanityQuery = `*[_type == "exam" && isPublished == true] | order(publishedAt desc) {
        _id, title, "slug": slug.current, shortDescription, thumbnail, level, examType, subject, paper, category, duration, totalMarks
      }`;
      sanityExams = await sanityClient.fetch(sanityQuery);
    } catch (e) {
      console.warn("Sanity fetch failed, falling back to local mocks", e.message);
    }

    const mongoExams = await ExamProduct.find({ isActive: true });

    // Add Mongo exams to the array if they are not already in sanityExams
    mongoExams.forEach(mExam => {
      const isAlreadyPresent = sanityExams.some(e => {
        const currentSlug = typeof e.slug === "string" ? e.slug : e.slug?.current;
        return currentSlug === mExam.slug;
      });

      if (!isAlreadyPresent) {
        sanityExams.push({
          _id: mExam._id.toString(),
          title: mExam.title,
          slug: mExam.slug,
          shortDescription: mExam.shortDescription,
          thumbnail: null,
          level: mExam.level,
          examType: mExam.examType,
          subject: mExam.subject,
          paper: mExam.paper,
          category: mExam.category,
          duration: mExam.duration,
          totalMarks: mExam.totalMarks,
          isFree: mExam.isFree || mExam.price === 0
        });
      }
    });

    const mergedExams = sanityExams.map((sExam) => {
      const currentSlug = typeof sExam.slug === "string" ? sExam.slug : sExam.slug?.current;
      const mExam = mongoExams.find((m) => m.slug === currentSlug);
      return {
        ...sExam,
        slug: currentSlug,
        isFree: mExam ? (mExam.isFree || mExam.price === 0) : false,
        product: mExam
          ? {
              id: mExam._id,
              price: mExam.price,
              discountPrice: mExam.discountPrice,
              totalEnrollments: mExam.totalEnrollments,
            }
          : null,
      };
    }).filter(e => e.product !== null); // only return exams that are in MongoDB

    res.json(mergedExams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExamBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let userId = null;
    if (req.user) userId = req.user.id; // optional authentication for public access

    const mongoExam = await ExamProduct.findOne({ slug });
    if (!mongoExam) return res.status(404).json({ message: "Exam product not found" });

    let sanityExam = null;
    try {
      const sanityQuery = `*[_type == "exam" && slug.current == $slug][0]`;
      sanityExam = await sanityClient.fetch(sanityQuery, { slug });
    } catch (e) {
      console.warn("Sanity fetch failed for slug", slug, e.message);
    }

    // Prioritize Mongo questions if they exist!
    if (mongoExam.questions && mongoExam.questions.length > 0) {
      sanityExam = {
        _id: mongoExam._id.toString(),
        title: mongoExam.title,
        slug: { current: mongoExam.slug },
        shortDescription: mongoExam.shortDescription,
        thumbnail: null,
        level: mongoExam.level,
        examType: mongoExam.examType,
        subject: mongoExam.subject,
        paper: mongoExam.paper,
        category: mongoExam.category,
        duration: mongoExam.duration,
        totalMarks: mongoExam.totalMarks,
        isPublished: true,
        questions: formatMongoQuestions(mongoExam.questions, true) // HIDE ANSWERS
      };
    } else if (!sanityExam) {
      const mock = MOCK_EXAMS.find(m => m.slug.current === slug);
      if (mock) {
        sanityExam = JSON.parse(JSON.stringify(mock));
        if (sanityExam.questions) {
          sanityExam.questions = sanityExam.questions.map(q => {
             const sanitizedOptions = q.options.map(opt => {
                 const { isCorrect, ...rest } = opt;
                 return rest;
             });
             return { ...q, options: sanitizedOptions, explanation: null };
          });
        }
      }
    } else {
      if (sanityExam.questions) {
        sanityExam.questions = sanityExam.questions.map(q => {
           const sanitizedOptions = q.options.map(opt => {
               const { isCorrect, ...rest } = opt;
               return rest;
           });
           return { ...q, options: sanitizedOptions, explanation: null };
        });
      }
    }

    if (!sanityExam) return res.status(404).json({ message: "Exam not found" });

    let enrolled = false;
    let attempts = [];
    if (userId) {
      enrolled = await isUserEnrolled(userId, slug);
      attempts = await ExamAttempt.find({ userId, examSlug: slug }).sort({ createdAt: -1 });
    }

    const finalSlug = typeof sanityExam.slug === "string" ? sanityExam.slug : sanityExam.slug?.current;

    res.json({
      ...sanityExam,
      slug: finalSlug,
      isFree: mongoExam.isFree || mongoExam.price === 0,
      product: {
        id: mongoExam._id,
        price: mongoExam.price,
        discountPrice: mongoExam.discountPrice,
        totalEnrollments: mongoExam.totalEnrollments,
      },
      isEnrolled: enrolled,
      attempts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.startExam = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const enrolled = await isUserEnrolled(userId, slug);
    if (!enrolled) {
      return res.status(403).json({ message: "Not enrolled in this exam" });
    }

    const newAttempt = await ExamAttempt.create({
      userId,
      examSlug: slug,
      status: "started",
    });

    res.status(201).json(newAttempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitMcqExam = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;
    const { attemptId, answers, timeSpent } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt || attempt.userId.toString() !== userId) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    if (attempt.status === "submitted") {
      return res.status(400).json({ message: "Already submitted" });
    }

    const mongoExam = await ExamProduct.findOne({ slug });
    let sanityExam = null;
    try {
      const sanityQuery = `*[_type == "exam" && slug.current == $slug][0] {
        questions
      }`;
      sanityExam = await sanityClient.fetch(sanityQuery, { slug });
    } catch (e) {
      console.warn("Sanity fetch failed on MCQ submit", e.message);
    }

    // Prioritize Mongo questions if they exist!
    if (mongoExam && mongoExam.questions && mongoExam.questions.length > 0) {
      sanityExam = {
        questions: formatMongoQuestions(mongoExam.questions, false) // KEEP ANSWERS FOR GRADING
      };
    } else if (!sanityExam) {
      const mock = MOCK_EXAMS.find(m => m.slug.current === slug);
      if (mock) {
        sanityExam = JSON.parse(JSON.stringify(mock));
      }
    }

    if (!sanityExam || !sanityExam.questions) {
      return res.status(404).json({ message: "Exam not found" });
    }

    let score = 0;
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    const processedAnswers = sanityExam.questions.map(q => {
       const userAns = answers.find(a => a.questionId === q._key);
       const correctOpt = q.options.find(o => o.isCorrect === true);
       
       if (!userAns || !userAns.selectedOptionId) {
          unanswered++;
          return { questionId: q._key, selectedOptionId: null };
       }
       
       if (userAns.selectedOptionId === correctOpt._key) {
          correct++;
          score += (q.marks || 1);
       } else {
          wrong++;
          score -= (q.negativeMark || 0.25);
       }
       return { questionId: q._key, selectedOptionId: userAns.selectedOptionId };
    });

    const totalQuestions = sanityExam.questions.length;
    const maxScore = sanityExam.questions.reduce((acc, curr) => acc + (curr.marks || 1), 0);
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    attempt.answers = processedAnswers;
    attempt.score = parseFloat(score.toFixed(2));
    attempt.correctAnswers = correct;
    attempt.wrongAnswers = wrong;
    attempt.unanswered = unanswered;
    attempt.percentage = parseFloat(percentage.toFixed(2));
    attempt.timeSpent = timeSpent;
    attempt.status = "submitted";
    attempt.submittedAt = new Date();

    await attempt.save();

    // Leaderboard logic
    const existingLeaderboard = await Leaderboard.findOne({ examSlug: slug, userId });
    if (!existingLeaderboard || existingLeaderboard.score < attempt.score) {
        if (existingLeaderboard) {
            existingLeaderboard.score = attempt.score;
            existingLeaderboard.percentage = attempt.percentage;
            existingLeaderboard.timeSpent = attempt.timeSpent;
            await existingLeaderboard.save();
        } else {
            await Leaderboard.create({
                examSlug: slug,
                userId,
                score: attempt.score,
                percentage: attempt.percentage,
                timeSpent: attempt.timeSpent
            });
        }
        
        // recalculate ranks
        const allEntries = await Leaderboard.find({ examSlug: slug }).sort({ score: -1, percentage: -1, timeSpent: 1 });
        for(let i=0; i<allEntries.length; i++){
            allEntries[i].rank = i + 1;
            await allEntries[i].save();
        }
    }

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitWritten = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const enrolled = await isUserEnrolled(userId, slug);
    if (!enrolled) {
      return res.status(403).json({ message: "Not enrolled in this exam" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `science-verse/written-submissions/${slug}`,
        resource_type: "auto",
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: "Cloudinary upload failed", error });
        }

        const submission = await WrittenSubmission.create({
          userId,
          examSlug: slug,
          cloudinaryUrl: result.secure_url,
          publicId: result.public_id,
          fileType: req.file.mimetype === "application/pdf" ? "pdf" : "image",
          status: "pending",
        });

        res.status(201).json(submission);
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { slug } = req.params;
    const leaderboard = await Leaderboard.find({ examSlug: slug })
      .populate("userId", "name photoURL")
      .sort({ rank: 1 })
      .limit(100);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyExams = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("enrolledExams");
    res.json(user.enrolledExams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExamResult = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;
        const attempt = await ExamAttempt.findOne({ examSlug: slug, userId, status: "submitted" }).sort({ submittedAt: -1 });
        
        if(!attempt) {
            return res.status(404).json({ message: "Result not found" });
        }

        const mongoExam = await ExamProduct.findOne({ slug });
        let sanityExam = null;
        try {
          const sanityQuery = `*[_type == "exam" && slug.current == $slug][0] {
            questions
          }`;
          sanityExam = await sanityClient.fetch(sanityQuery, { slug });
        } catch (e) {
          console.warn("Sanity fetch failed on getExamResult", e.message);
        }

        // Prioritize Mongo questions
        if (mongoExam && mongoExam.questions && mongoExam.questions.length > 0) {
          sanityExam = {
            questions: formatMongoQuestions(mongoExam.questions, false) // KEEP ANSWERS FOR DISPLAYING EXPLANATIONS
          };
        } else if (!sanityExam) {
          const mock = MOCK_EXAMS.find(m => m.slug.current === slug);
          if (mock) {
            sanityExam = JSON.parse(JSON.stringify(mock));
          }
        }

        if (!sanityExam || !sanityExam.questions) {
            return res.status(404).json({ message: "Exam questions not found" });
        }

        res.json({
            attempt,
            questionsWithAnswers: sanityExam.questions
        });
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createExam = async (req, res) => {
  try {
    const { title, slug, price, discountPrice, shortDescription, duration, totalMarks, level, examType, subject, paper, category, questions, isFree } = req.body;
    
    const existing = await ExamProduct.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Exam with this slug already exists" });
    }

    const exam = await ExamProduct.create({
      title,
      slug,
      price: price || 0,
      discountPrice: discountPrice || 0,
      shortDescription: shortDescription || "",
      duration: duration || 10,
      totalMarks: totalMarks || 0,
      level: level || "HSC",
      examType: examType || "MCQ",
      subject: subject || "",
      paper: paper || "1st",
      category: category || "Regular",
      questions: questions || [],
      isActive: true,
      isFree: isFree || false
    });

    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, price, discountPrice, shortDescription, duration, totalMarks, level, examType, subject, paper, category, questions, isFree } = req.body;

    const exam = await ExamProduct.findById(id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (slug && slug !== exam.slug) {
      const existing = await ExamProduct.findOne({ slug });
      if (existing) {
        return res.status(400).json({ message: "Exam with this slug already exists" });
      }
      exam.slug = slug;
    }

    if (title !== undefined) exam.title = title;
    if (price !== undefined) exam.price = price;
    if (discountPrice !== undefined) exam.discountPrice = discountPrice;
    if (shortDescription !== undefined) exam.shortDescription = shortDescription;
    if (duration !== undefined) exam.duration = duration;
    if (totalMarks !== undefined) exam.totalMarks = totalMarks;
    if (level !== undefined) exam.level = level;
    if (examType !== undefined) exam.examType = examType;
    if (subject !== undefined) exam.subject = subject;
    if (paper !== undefined) exam.paper = paper;
    if (category !== undefined) exam.category = category;
    if (questions !== undefined) exam.questions = questions;
    if (isFree !== undefined) exam.isFree = isFree;

    await exam.save();
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await ExamProduct.findByIdAndDelete(id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.json({ message: "Exam deleted successfully", exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
