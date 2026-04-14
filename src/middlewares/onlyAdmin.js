

exports.onlyAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only",
            });
        }

        next();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};