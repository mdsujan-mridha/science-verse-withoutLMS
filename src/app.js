

const express = require("express");
const cors = require("cors");

const app = express();


app.use(express.json());


app.use(express.urlencoded({ extended: true }));
// app.use(express.json());


app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:8081'],
    credentials: true
}));



// course routes
const courseRoutes = require("./routes/courseRoutes");
app.use("/api/v1/courses", courseRoutes);

// order routes 
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/v1/orders", orderRoutes);

// exam routes
const examRoutes = require("./routes/examRoutes");
app.use("/api/v1/exams", examRoutes);

app.get("/", (req, res) => {
    res.send("🚀 Science Verse API is running");
});

module.exports = app;