const mongoose = require("mongoose");
require("dotenv").config();
const ExamProduct = require("../model/ExamProduct");

const seedExam = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ScienceVerse");
    console.log("Database connected successfully!");

    // Clear previous mock
    await ExamProduct.deleteMany({ slug: { $in: ["physics-mcq-1", "chem-mcq-1", "math-mcq-1"] } });

    // Seed Physics Exam
    const physicsExam = await ExamProduct.create({
      title: "HSC Physics MCQ - Chapter 1: Physical World and Measurement",
      slug: "physics-mcq-1",
      price: 150,
      discountPrice: 99,
      totalEnrollments: 42,
      totalRevenue: 4158,
      isActive: true,
      shortDescription: "A comprehensive MCQ practice exam on Physical World, Dimensions, Units and Measurements for HSC students.",
      duration: 10,
      totalMarks: 5,
      level: "HSC",
      examType: "MCQ",
      subject: "Physics",
      paper: "1st",
      category: "Regular",
      questions: [
        {
          questionText: "Which of the following is not a fundamental physical quantity?",
          marks: 1,
          negativeMark: 0.25,
          options: [
            { optionText: "Mass", isCorrect: false },
            { optionText: "Length", isCorrect: false },
            { optionText: "Time", isCorrect: false },
            { optionText: "Velocity", isCorrect: true }
          ],
          explanation: "Velocity is a derived quantity (Length / Time), whereas Mass, Length, and Time are fundamental quantities."
        },
        {
          questionText: "What is the dimensional formula for Force?",
          marks: 1,
          negativeMark: 0.25,
          options: [
            { optionText: "[MLT^-1]", isCorrect: false },
            { optionText: "[MLT^-2]", isCorrect: true },
            { optionText: "[ML^2T^-2]", isCorrect: false },
            { optionText: "[ML^-1T^-2]", isCorrect: false }
          ],
          explanation: "Force = Mass * Acceleration. Dimension of Mass is [M], Acceleration is [LT^-2]. Thus, Force is [MLT^-2]."
        },
        {
          questionText: "The unit of Planck's Constant is:",
          marks: 1,
          negativeMark: 0.25,
          options: [
            { optionText: "Joule-second (J·s)", isCorrect: true },
            { optionText: "Joule/second (J/s)", isCorrect: false },
            { optionText: "Joule-meter (J·m)", isCorrect: false },
            { optionText: "Joule/meter (J/m)", isCorrect: false }
          ],
          explanation: "E = hν => h = E/ν. E is energy (Joule) and ν is frequency (1/second). So, unit of h is Joule-second (J·s)."
        },
        {
          questionText: "Which of the following physical quantities is dimensionless and has no unit?",
          marks: 1,
          negativeMark: 0.25,
          options: [
            { optionText: "Strain", isCorrect: true },
            { optionText: "Stress", isCorrect: false },
            { optionText: "Pressure", isCorrect: false },
            { optionText: "Surface Tension", isCorrect: false }
          ],
          explanation: "Strain is the ratio of change in dimension to original dimension, hence it is dimensionless and unitless."
        },
        {
          questionText: "Light year is the unit of:",
          marks: 1,
          negativeMark: 0.25,
          options: [
            { optionText: "Time", isCorrect: false },
            { optionText: "Distance", isCorrect: true },
            { optionText: "Intensity of light", isCorrect: false },
            { optionText: "Velocity of light", isCorrect: false }
          ],
          explanation: "Light year is the distance light travels in one vacuum year, which is approx. 9.46 trillion kilometers."
        }
      ]
    });
    console.log("Physics Exam seeded with questions successfully!");

    // Seed Chemistry Exam
    const chemistryExam = await ExamProduct.create({
      title: "HSC Chemistry MCQ - Chapter 1: Organic Chemistry",
      slug: "chem-mcq-1",
      price: 120,
      discountPrice: 80,
      totalEnrollments: 25,
      totalRevenue: 2000,
      isActive: true,
      shortDescription: "Comprehensive evaluation on basic Organic chemistry nomenclature, nucleophiles, and alkanes.",
      duration: 15,
      totalMarks: 3,
      level: "HSC",
      examType: "MCQ",
      subject: "Chemistry",
      paper: "1st",
      category: "Regular",
      questions: [
        {
          questionText: "Which of the following is a nucleophile?",
          marks: 1,
          negativeMark: 0.25,
          options: [
            { optionText: "$NH_3$", isCorrect: true },
            { optionText: "$BF_3$", isCorrect: false },
            { optionText: "$AlCl_3$", isCorrect: false },
            { optionText: "$H^+$", isCorrect: false }
          ],
          explanation: "NH3 has a lone pair of electrons on the nitrogen atom, allowing it to act as a nucleophile (electron pair donor)."
        },
        {
          questionText: "What is the general formula for Alkanes?",
          marks: 1,
          negativeMark: 0.25,
          options: [
            { optionText: "$C_n H_{2n+2}$", isCorrect: true },
            { optionText: "$C_n H_{2n}$", isCorrect: false },
            { optionText: "$C_n H_{2n-2}$", isCorrect: false },
            { optionText: "$C_n H_{2n+1}$", isCorrect: false }
          ],
          explanation: "Alkanes are saturated hydrocarbons with the general chemical formula CnH2n+2."
        },
        {
          questionText: "The hybridization of carbon in Methane ($CH_4$) is:",
          marks: 1,
          negativeMark: 0.25,
          options: [
            { optionText: "$sp^3$", isCorrect: true },
            { optionText: "$sp^2$", isCorrect: false },
            { optionText: "$sp$", isCorrect: false },
            { optionText: "$dsp^2$", isCorrect: false }
          ],
          explanation: "Carbon in methane forms 4 single sigma bonds with hydrogen atoms, resulting in sp3 hybridization."
        }
      ]
    });
    console.log("Chemistry Exam seeded successfully!");

    // Seed Free Math Exam
    const mathExam = await ExamProduct.create({
      title: "HSC Higher Mathematics MCQ - Chapter 1: Matrices and Determinants",
      slug: "math-mcq-1",
      price: 0,
      discountPrice: 0,
      totalEnrollments: 89,
      totalRevenue: 0,
      isActive: true,
      isFree: true,
      shortDescription: "A completely free MCQ evaluation covering key properties of matrices, orders, and symmetric operations for HSC preparation.",
      duration: 10,
      totalMarks: 3,
      level: "HSC",
      examType: "MCQ",
      subject: "Mathematics",
      paper: "1st",
      category: "Regular",
      questions: [
        {
          questionText: "If $A$ is a matrix of order $3 \\times 4$ and $B$ is a matrix of order $4 \\times 5$, what is the order of the product matrix $AB$?",
          marks: 1,
          negativeMark: 0.25,
          options: [
            { optionText: "$3 \\times 5$", isCorrect: true },
            { optionText: "$4 \\times 4$", isCorrect: false },
            { optionText: "$3 \\times 4$", isCorrect: false },
            { optionText: "$5 \\times 3$", isCorrect: false }
          ],
          explanation: "For matrix multiplication AB to exist, columns of A (4) must match rows of B (4). The resulting matrix AB has rows of A (3) and columns of B (5), so the order is 3x5."
        },
        {
          questionText: "If the determinant of a $2 \\times 2$ matrix $A$ is zero, i.e., $\\det(A) = 0$, then $A$ is a:",
          marks: 1,
          negativeMark: 0.25,
          options: [
            { optionText: "Singular matrix", isCorrect: true },
            { optionText: "Identity matrix", isCorrect: false },
            { optionText: "Symmetric matrix", isCorrect: false },
            { optionText: "Non-singular matrix", isCorrect: false }
          ],
          explanation: "By definition, a square matrix is singular if and only if its determinant is exactly zero."
        },
        {
          questionText: "For any square matrix $A$, the operation $A + A^T$ (where $A^T$ is the transpose of matrix $A$) is always a:",
          marks: 1,
          negativeMark: 0.25,
          options: [
            { optionText: "Symmetric matrix", isCorrect: true },
            { optionText: "Skew-symmetric matrix", isCorrect: false },
            { optionText: "Diagonal matrix", isCorrect: false },
            { optionText: "Zero matrix", isCorrect: false }
          ],
          explanation: "Let B = A + A^T. Then B^T = (A + A^T)^T = A^T + (A^T)^T = A^T + A = A + A^T = B. Since B^T = B, it is always symmetric."
        }
      ]
    });
    console.log("Free Math Exam seeded successfully!");

    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedExam();
