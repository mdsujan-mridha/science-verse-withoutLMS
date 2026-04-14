



const admin = require("firebase-admin");
const User = require("../model/UserModel");

// verify firebase token
exports.protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token",
            });
        }

        // verify token
        const decoded = await admin.auth().verifyIdToken(token);

        // find user in DB
        const user = await User.findOne({ firebaseUID: decoded.uid });

        if (!user) {
            user = await User.create({
                firebaseUID: decoded.uid,
                email: decoded.email,
                name: decoded.name || "Student",
                role: "user",
                photoURL: decoded.picture || "",
            });
        }

        req.user = user; // attach user
        next();

    } catch (error) {
        console.error("Auth Error:", error.message);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};