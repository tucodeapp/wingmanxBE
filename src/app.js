const express = require("express");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(express.json()); // Middleware to parse JSON

app.use("/api/users", userRoutes); // Route handling

module.exports = app; // Export the app
